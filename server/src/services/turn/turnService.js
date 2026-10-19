import { getIceServers } from '../../config/iceServers.js';

class TurnService {
  getIceCredentials(userId, sessionId) {
    const iceServers = getIceServers();
    return {
      iceServers,
      ttl: 86400,
      timestamp: Date.now()
    };
  }
}

export const turnService = new TurnService();
