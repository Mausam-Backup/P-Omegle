import { getIceServers } from '../../config/iceServers.js';
import { config } from '../../config/env.js';

class TurnService {
  constructor() {
    this.cachedMeteredServers = null;
    this.cacheExpiresAt = 0;
  }

  async getIceCredentials(userId, sessionId) {
    // 1. If Metered API credentials are configured, fetch dynamic TURN servers
    if (config.meteredApiKey && config.meteredDomain) {
      const now = Date.now();
      if (this.cachedMeteredServers && now < this.cacheExpiresAt) {
        return {
          iceServers: this.cachedMeteredServers,
          ttl: 3600,
          timestamp: now
        };
      }

      try {
        const cleanDomain = config.meteredDomain.replace('.metered.live', '').trim();
        const key = config.meteredApiKey.trim();
        let meteredServers = null;

        // Strategy 1: Check existing active credentials via v2 list API (avoids hitting 10 credential limit)
        try {
          const resV2 = await fetch(`https://${cleanDomain}.metered.live/api/v2/turn/credentials?secretKey=${key}`);
          if (resV2.ok) {
            const jsonV2 = await resV2.json();
            const activeCreds = jsonV2.data;
            if (Array.isArray(activeCreds) && activeCreds.length > 0) {
              const cred = activeCreds[0];
              // If credential has an apiKey, fetch official ICE servers
              if (cred.apiKey) {
                try {
                  const resServers = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${cred.apiKey}`);
                  if (resServers.ok) {
                    const serversJson = await resServers.json();
                    if (Array.isArray(serversJson) && serversJson.length > 0) {
                      meteredServers = serversJson;
                    }
                  }
                } catch {}
              }

              // Fallback: construct standard edge relay endpoints directly
              if (!meteredServers && cred.username && (cred.password || cred.credential)) {
                meteredServers = [
                  { urls: 'stun:stun.relay.metered.ca:80' },
                  {
                    urls: [
                      'turn:global.relay.metered.ca:80',
                      'turn:global.relay.metered.ca:80?transport=tcp',
                      'turn:global.relay.metered.ca:443',
                      'turns:global.relay.metered.ca:443?transport=tcp'
                    ],
                    username: cred.username,
                    credential: cred.password || cred.credential
                  }
                ];
              }
            }
          }
        } catch (v2Err) {
          console.warn('[TurnService] v2 list error:', v2Err.message);
        }

        // Strategy 2: If no existing credentials, create a new one via POST
        if (!meteredServers) {
          try {
            const resPost = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credential?secretKey=${key}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expiryInSeconds: 86400 })
            });
            if (resPost.ok) {
              const data = await resPost.json();
              if (data && data.apiKey) {
                try {
                  const resServers = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${data.apiKey}`);
                  if (resServers.ok) {
                    const serversJson = await resServers.json();
                    if (Array.isArray(serversJson) && serversJson.length > 0) {
                      meteredServers = serversJson;
                    }
                  }
                } catch {}
              }

              if (!meteredServers && data && data.username && (data.password || data.credential)) {
                meteredServers = [
                  { urls: 'stun:stun.relay.metered.ca:80' },
                  {
                    urls: [
                      'turn:global.relay.metered.ca:80',
                      'turn:global.relay.metered.ca:80?transport=tcp',
                      'turn:global.relay.metered.ca:443',
                      'turns:global.relay.metered.ca:443?transport=tcp'
                    ],
                    username: data.username,
                    credential: data.password || data.credential
                  }
                ];
              }
            }
          } catch (postErr) {
            console.warn('[TurnService] POST credential error:', postErr.message);
          }
        }

        // Strategy 3: Try standard apiKey GET
        if (!meteredServers) {
          try {
            const resGet = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${key}`);
            if (resGet.ok) {
              const data = await resGet.json();
              if (Array.isArray(data) && data.length > 0) {
                meteredServers = data;
              }
            }
          } catch {}
        }

        if (meteredServers && meteredServers.length > 0) {
          const fullList = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            ...meteredServers
          ];
          this.cachedMeteredServers = fullList;
          this.cacheExpiresAt = now + 60 * 60 * 1000; // Cache 1 hour
          return {
            iceServers: fullList,
            ttl: 3600,
            timestamp: now
          };
        }
      } catch (err) {
        console.warn('[TurnService] Metered API fetch error, using static fallback:', err.message);
      }
    }

    // 2. Static configuration fallback (Google/Mozilla/Twilio STUN + custom TURN)
    const iceServers = getIceServers();
    return {
      iceServers,
      ttl: 86400,
      timestamp: Date.now()
    };
  }
}

export const turnService = new TurnService();
