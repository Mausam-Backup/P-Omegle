/**
 * MemoryStore
 * In-memory state and storage engine matching the PRD Redis key schema
 * and PostgreSQL service-separated data stores.
 * Provides atomic operations, TTL cleanup, and thread-safe JavaScript event loops.
 */

class MemoryStore {
  constructor() {
    // Identity store
    this.users = new Map(); // userId -> { id, email, passwordHash, isAdult, isModerator, isBanned, isSuspended, createdAt }
    this.refreshTokens = new Map(); // token -> userId

    // Matchmaking state & Redis keys
    // queueKey -> Array<{ userId, mode, language, interests, enteredAt, socketId }>
    this.queues = new Map();

    // user:{id}:state -> 'idle' | 'searching' | 'in_session'
    this.userStates = new Map();

    // user:{id}:session -> sessionId
    this.userCurrentSession = new Map();

    // session:{id} -> { id, peerA, peerB, mode, sharedInterests, state, startedAt, endedAt, lastHeartbeatA, lastHeartbeatB, graceTimeout }
    this.sessions = new Map();

    // recent:{id} -> Map<partnerId, timestamp> (cool-down tracking)
    this.recentPartners = new Map();

    // blocks:{id} -> Set<blockedUserId>
    this.blocks = new Map();

    // presence:{id} -> { socketId, lastSeen, ip }
    this.presence = new Map();

    // Safety & Moderation
    this.reports = []; // Array<{ id, reporterId, reportedId, sessionId, reason, comment, evidenceSnapshot, timestamp, status }>
    this.evidenceSnapshots = new Map(); // sessionId -> Array<{ senderId, type, content, timestamp }>

    // Rate limiting: ratelimit:{scope}:{id} -> { count, expiresAt }
    this.rateLimits = new Map();
  }

  // --- Identity ---
  saveUser(user) {
    this.users.set(user.id, { ...user });
    return this.users.get(user.id);
  }

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  getUser(userId) {
    return this.users.get(userId) || null;
  }

  deleteUser(userId) {
    this.users.delete(userId);
    this.blocks.delete(userId);
    this.recentPartners.delete(userId);
    return true;
  }

  // --- Blocks ---
  addBlock(userId, targetUserId) {
    if (!this.blocks.has(userId)) {
      this.blocks.set(userId, new Set());
    }
    this.blocks.get(userId).add(targetUserId);
  }

  isBlocked(userA, userB) {
    const aBlocksB = this.blocks.has(userA) && this.blocks.get(userA).has(userB);
    const bBlocksA = this.blocks.has(userB) && this.blocks.get(userB).has(userA);
    return aBlocksB || bBlocksA;
  }

  // --- Cool-down (Recent Partners) ---
  recordRecentPartner(userA, userB, cooldownMs = 15000) {
    const now = Date.now();
    const cleanAndAdd = (from, to) => {
      if (!this.recentPartners.has(from)) {
        this.recentPartners.set(from, new Map());
      }
      const map = this.recentPartners.get(from);
      // clean stale
      for (const [id, time] of map.entries()) {
        if (now - time > cooldownMs) map.delete(id);
      }
      map.set(to, now);
    };

    cleanAndAdd(userA, userB);
    cleanAndAdd(userB, userA);
  }

  isRecentPartner(userA, userB, cooldownMs = 15000) {
    const map = this.recentPartners.get(userA);
    if (!map || !map.has(userB)) return false;
    const time = map.get(userB);
    if (Date.now() - time < cooldownMs) {
      return true;
    }
    map.delete(userB);
    return false;
  }

  // --- Session Management ---
  createSessionRecord(sessionData) {
    const sessionId = sessionData.id;
    this.sessions.set(sessionId, {
      ...sessionData,
      state: 'CONNECTING',
      startedAt: Date.now(),
      lastHeartbeatA: Date.now(),
      lastHeartbeatB: Date.now(),
      graceTimeout: null
    });
    this.userCurrentSession.set(sessionData.peerA, sessionId);
    this.userCurrentSession.set(sessionData.peerB, sessionId);
    this.userStates.set(sessionData.peerA, 'in_session');
    this.userStates.set(sessionData.peerB, 'in_session');
    return this.sessions.get(sessionId);
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  getUserCurrentSession(userId) {
    const sessionId = this.userCurrentSession.get(userId);
    return sessionId ? this.sessions.get(sessionId) : null;
  }

  updateSessionState(sessionId, newState) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = newState;
      if (newState === 'ENDED') {
        session.endedAt = Date.now();
        this.userCurrentSession.delete(session.peerA);
        this.userCurrentSession.delete(session.peerB);
        this.userStates.set(session.peerA, 'idle');
        this.userStates.set(session.peerB, 'idle');
      }
    }
    return session;
  }

  clearUserSession(userId) {
    const sessionId = this.userCurrentSession.get(userId);
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.state = 'ENDED';
        session.endedAt = Date.now();
        this.userCurrentSession.delete(session.peerA);
        this.userCurrentSession.delete(session.peerB);
      }
      this.userCurrentSession.delete(userId);
    }
    this.userStates.set(userId, 'idle');
  }

  // --- Evidence Snapshot (for reporting) ---
  addEvidence(sessionId, event) {
    if (!this.evidenceSnapshots.has(sessionId)) {
      this.evidenceSnapshots.set(sessionId, []);
    }
    const list = this.evidenceSnapshots.get(sessionId);
    list.push({ ...event, timestamp: Date.now() });
    // Keep max 30 rolling items per session (data minimization)
    if (list.length > 30) list.shift();
  }

  getEvidence(sessionId) {
    return this.evidenceSnapshots.get(sessionId) || [];
  }

  // --- Reports & Moderation ---
  saveReport(report) {
    const reportItem = {
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      ...report,
      timestamp: Date.now(),
      status: 'PENDING'
    };
    this.reports.push(reportItem);
    return reportItem;
  }

  getReports() {
    return [...this.reports].reverse();
  }

  updateReportStatus(reportId, status) {
    const rep = this.reports.find(r => r.id === reportId);
    if (rep) rep.status = status;
    return rep;
  }

  // --- Presence & Counter ---
  setPresence(userId, socketId, ip) {
    this.presence.set(userId, { socketId, ip, lastSeen: Date.now() });
  }

  removePresence(userId) {
    this.presence.delete(userId);
  }

  getOnlineCount() {
    // Filter heartbeats older than 30s
    const threshold = Date.now() - 30000;
    let count = 0;
    for (const [userId, p] of this.presence.entries()) {
      if (p.lastSeen > threshold) {
        count++;
      } else {
        this.presence.delete(userId);
      }
    }
    return Math.max(1, count); // minimum 1 for realistic presentation
  }
}

export const memoryStore = new MemoryStore();
