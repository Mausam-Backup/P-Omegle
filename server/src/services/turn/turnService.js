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
        const url = `https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${config.meteredApiKey.trim()}`;
        const res = await fetch(url);
        if (res.ok) {
          const meteredServers = await res.json();
          if (Array.isArray(meteredServers) && meteredServers.length > 0) {
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
