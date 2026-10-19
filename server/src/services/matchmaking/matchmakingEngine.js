import crypto from 'crypto';
import { memoryStore } from '../../store/memoryStore.js';
import { config } from '../../config/env.js';

class MatchmakingEngine {
  constructor() {
    // waitingPool: Array<{ userId, socketId, mode, language, interests: string[], joinedAt: number, fallbackTriggered: boolean }>
    this.waitingPool = [];
    this.lock = false;

    // Periodic matcher tick to evaluate interest timeouts and fallback
    this.tickInterval = setInterval(() => this.processPool(), 250);
  }

  getShardKey(mode, language = 'en') {
    return `${mode.toLowerCase()}:${language.toLowerCase()}`;
  }

  /**
   * Atomic enqueue:
   * Validates user state (not banned, not already in active session, cleans prior waiting state)
   */
  joinQueue({ userId, socketId, mode, language = 'en', interests = [] }) {
    // Check if user is banned or suspended
    const user = memoryStore.getUser(userId);
    if (user && (user.isBanned || user.isSuspended)) {
      throw new Error('Your account is restricted from matchmaking.');
    }

    // Clean any existing waiting entry or lingering session
    this.leaveQueue(userId);

    // Clean any prior session for this user (fast skip rule FR-SESS-02)
    memoryStore.clearUserSession(userId);

    // Format interests (max 5, lowercase, trimmed)
    const normalizedInterests = (Array.isArray(interests) ? interests : [])
      .map(i => String(i).trim().toLowerCase())
      .filter(i => i.length > 0)
      .slice(0, 5);

    const entry = {
      userId,
      socketId,
      mode: mode === 'video' ? 'video' : 'text',
      language: language || 'en',
      interests: normalizedInterests,
      joinedAt: Date.now(),
      fallbackTriggered: false
    };

    memoryStore.userStates.set(userId, 'searching');
    this.waitingPool.push(entry);
    return true;
  }

  leaveQueue(userId) {
    const idx = this.waitingPool.findIndex(e => e.userId === userId);
    if (idx !== -1) {
      this.waitingPool.splice(idx, 1);
    }
    if (memoryStore.userStates.get(userId) === 'searching') {
      memoryStore.userStates.set(userId, 'idle');
    }
    return true;
  }

  /**
   * Atomic Matchmaking Evaluation Loop
   * Respects mode, language, interest matching (with 5s fallback to random),
   * block lists, cool-down, self-exclusion.
   */
  processPool() {
    if (this.lock) return null;
    this.lock = true;

    try {
      const now = Date.now();
      const matches = [];
      const pairedUserIds = new Set();

      for (let i = 0; i < this.waitingPool.length; i++) {
        const candidateA = this.waitingPool[i];
        if (!candidateA || pairedUserIds.has(candidateA.userId)) continue;

        const waitDurationA = now - candidateA.joinedAt;
        const allowRandomA = candidateA.interests.length === 0 || waitDurationA >= config.interestTimeoutMs;

        let bestPartner = null;
        let bestSharedInterests = [];
        let isInterestMatch = false;

        for (let j = i + 1; j < this.waitingPool.length; j++) {
          const candidateB = this.waitingPool[j];
          if (!candidateB || pairedUserIds.has(candidateB.userId)) continue;

          // Must be distinct users and sockets
          if (candidateA.userId === candidateB.userId) continue;
          if (candidateA.socketId === candidateB.socketId) continue;

          // Must match mode (text vs video)
          if (candidateA.mode !== candidateB.mode) continue;

          // Block filter check (FR-MATCH-04)
          if (memoryStore.isBlocked(candidateA.userId, candidateB.userId)) {
            continue;
          }

          // Cool-down filter check (FR-MATCH-05): Only enforce cooldown if other candidate choices exist in pool
          const hasAlternativeCandidates = this.waitingPool.length > 2;
          if (hasAlternativeCandidates && memoryStore.isRecentPartner(candidateA.userId, candidateB.userId, config.cooldownMs)) {
            continue;
          }

          // Calculate shared interests
          const shared = candidateA.interests.filter(tag => candidateB.interests.includes(tag));

          if (shared.length > 0) {
            // Prioritize interest match
            bestPartner = candidateB;
            bestSharedInterests = shared;
            isInterestMatch = true;
            break; // immediate priority match found!
          }

          // If no shared interests, can we fall back to random?
          const waitDurationB = now - candidateB.joinedAt;
          const allowRandomA = this.waitingPool.length <= 2 || candidateA.interests.length === 0 || waitDurationA >= config.interestTimeoutMs;
          const allowRandomB = this.waitingPool.length <= 2 || candidateB.interests.length === 0 || waitDurationB >= config.interestTimeoutMs;

          if (allowRandomA && allowRandomB && !isInterestMatch && !bestPartner) {
            // Eligible random fallback match candidate
            bestPartner = candidateB;
            bestSharedInterests = [];
            break;
          }
        }

        if (bestPartner) {
          pairedUserIds.add(candidateA.userId);
          pairedUserIds.add(bestPartner.userId);

          // Record recent partner for cooldown
          memoryStore.recordRecentPartner(candidateA.userId, bestPartner.userId, config.cooldownMs);

          // Create session ID
          const sessionId = 'sess_' + crypto.randomBytes(8).toString('hex');

          matches.push({
            sessionId,
            mode: candidateA.mode,
            sharedInterests: bestSharedInterests,
            peerA: {
              userId: candidateA.userId,
              socketId: candidateA.socketId,
              role: 'initiator'
            },
            peerB: {
              userId: bestPartner.userId,
              socketId: bestPartner.socketId,
              role: 'receiver'
            }
          });
        }
      }

      // Remove all paired candidates from waiting pool
      if (pairedUserIds.size > 0) {
        this.waitingPool = this.waitingPool.filter(e => !pairedUserIds.has(e.userId));
      }

      return matches;
    } finally {
      this.lock = false;
    }
  }

  getQueueSize() {
    return this.waitingPool.length;
  }
}

export const matchmakingEngine = new MatchmakingEngine();
