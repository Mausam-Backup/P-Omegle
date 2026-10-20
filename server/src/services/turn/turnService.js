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

        // Try 1: Standard API Key GET
        try {
          const resGet = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${key}`);
          if (resGet.ok) {
            const data = await resGet.json();
            if (Array.isArray(data) && data.length > 0) {
              meteredServers = data;
            }
          }
        } catch {}

        // Try 2: Secret Key POST
        if (!meteredServers) {
          try {
            const resPost = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credential?secretKey=${key}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expiryInSeconds: 86400 })
            });
            if (resPost.ok) {
              const data = await resPost.json();
              if (Array.isArray(data)) {
                meteredServers = data;
              } else if (data && (data.urls || data.username)) {
                meteredServers = [
                  {
                    urls: Array.isArray(data.urls) ? data.urls : [
                      `turn:${cleanDomain}.metered.live:80`,
                      `turn:${cleanDomain}.metered.live:443`,
                      `turn:${cleanDomain}.metered.live:443?transport=tcp`,
                      `turns:${cleanDomain}.metered.live:443?transport=tcp`
                    ],
                    username: data.username,
                    credential: data.credential || data.password
                  }
                ];
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
          this.cacheExpiresAt = now + 10 * 60 * 1000; // Cache 10 minutes
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
