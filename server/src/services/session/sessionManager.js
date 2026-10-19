import { memoryStore } from '../../store/memoryStore.js';
import { config } from '../../config/env.js';

class SessionManager {
  constructor() {
    this.graceTimers = new Map(); // sessionId -> timer
  }

  createSession({ sessionId, peerA, peerB, mode, sharedInterests = [] }) {
    return memoryStore.createSessionRecord({
      id: sessionId,
      peerA: peerA.userId,
      peerB: peerB.userId,
      peerASocketId: peerA.socketId,
      peerBSocketId: peerB.socketId,
      mode,
      sharedInterests
    });
  }

  getSession(sessionId) {
    return memoryStore.getSession(sessionId);
  }

  isParticipant(sessionId, userId) {
    const session = memoryStore.getSession(sessionId);
    if (!session || session.state === 'ENDED') return false;
    return session.peerA === userId || session.peerB === userId;
  }

  getPartnerId(sessionId, userId) {
    const session = memoryStore.getSession(sessionId);
    if (!session) return null;
    if (session.peerA === userId) return session.peerB;
    if (session.peerB === userId) return session.peerA;
    return null;
  }

  /**
   * Fast Skip Implementation (FR-SESS-01, FR-SESS-02)
   * 1. Invalidate old session immediately
   * 2. Clear user-to-session pointers
   * 3. Clear any active grace timers
   * 4. Return partnerId so realtime gateway can immediately inform partner
   */
  skipSession(sessionId, initiatorUserId) {
    const session = memoryStore.getSession(sessionId);
    if (!session) return { partnerId: null, ended: false };

    // Clear any grace timer if running
    if (this.graceTimers.has(sessionId)) {
      clearTimeout(this.graceTimers.get(sessionId));
      this.graceTimers.delete(sessionId);
    }

    const partnerId = this.getPartnerId(sessionId, initiatorUserId);

    // End session in memory store
    memoryStore.updateSessionState(sessionId, 'ENDED');

    return {
      partnerId,
      ended: true,
      initiatorId: initiatorUserId
    };
  }

  /**
   * Disconnect Grace Period Handling (FR-SESS-04, FR-SESS-05)
   */
  handleDisconnect(userId, onGraceExpiredCallback) {
    const session = memoryStore.getUserCurrentSession(userId);
    if (!session || session.state === 'ENDED') {
      memoryStore.clearUserSession(userId);
      return null;
    }

    const sessionId = session.id;
    const partnerId = this.getPartnerId(sessionId, userId);

    // Mark session in GRACE state
    session.state = 'GRACE';

    // Start 15s grace timer
    if (this.graceTimers.has(sessionId)) {
      clearTimeout(this.graceTimers.get(sessionId));
    }

    const timer = setTimeout(() => {
      this.graceTimers.delete(sessionId);
      const curSession = memoryStore.getSession(sessionId);
      if (curSession && curSession.state === 'GRACE') {
        memoryStore.updateSessionState(sessionId, 'ENDED');
        if (typeof onGraceExpiredCallback === 'function') {
          onGraceExpiredCallback(sessionId, partnerId);
        }
      }
    }, config.sessionGracePeriodMs);

    this.graceTimers.set(sessionId, timer);

    return {
      sessionId,
      partnerId,
      inGrace: true
    };
  }

  handleReconnect(userId, newSocketId) {
    const session = memoryStore.getUserCurrentSession(userId);
    if (!session || session.state !== 'GRACE') return null;

    const sessionId = session.id;
    if (this.graceTimers.has(sessionId)) {
      clearTimeout(this.graceTimers.get(sessionId));
      this.graceTimers.delete(sessionId);
    }

    // Restore active state and update socket reference
    session.state = 'ACTIVE';
    if (session.peerA === userId) {
      session.peerASocketId = newSocketId;
      session.lastHeartbeatA = Date.now();
    } else {
      session.peerBSocketId = newSocketId;
      session.lastHeartbeatB = Date.now();
    }

    const partnerId = this.getPartnerId(sessionId, userId);
    return {
      sessionId,
      partnerId,
      restored: true
    };
  }

  heartbeat(sessionId, userId) {
    const session = memoryStore.getSession(sessionId);
    if (!session || session.state === 'ENDED') return false;

    if (session.peerA === userId) {
      session.lastHeartbeatA = Date.now();
    } else if (session.peerB === userId) {
      session.lastHeartbeatB = Date.now();
    }
    return true;
  }
}

export const sessionManager = new SessionManager();
