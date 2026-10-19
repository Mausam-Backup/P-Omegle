import { memoryStore } from '../../store/memoryStore.js';
import { matchmakingEngine } from '../matchmaking/matchmakingEngine.js';

class PresenceTracker {
  registerPresence(userId, socketId, ip) {
    memoryStore.setPresence(userId, socketId, ip);
  }

  unregisterPresence(userId) {
    memoryStore.removePresence(userId);
  }

  getPublicStats() {
    return {
      onlineUsers: memoryStore.getOnlineCount(),
      waitingInQueue: matchmakingEngine.getQueueSize(),
      activeSessions: Math.floor(memoryStore.sessions.size / 2)
    };
  }
}

export const presenceTracker = new PresenceTracker();
