import { memoryStore } from '../../store/memoryStore.js';
import { sessionManager } from '../session/sessionManager.js';

class SafetyManager {
  fileReport({ reporterId, reportedId, sessionId, reason, comment }) {
    if (!reporterId) {
      throw new Error('Reporter ID is required');
    }

    // If reportedId is not explicitly sent, derive from sessionId
    let targetUserId = reportedId;
    if (!targetUserId && sessionId) {
      targetUserId = sessionManager.getPartnerId(sessionId, reporterId);
    }

    if (!targetUserId) {
      throw new Error('Could not identify reported partner');
    }

    // Retrieve rolling evidence snapshot (recent messages and timing)
    const evidence = sessionId ? memoryStore.getEvidence(sessionId) : [];

    const report = memoryStore.saveReport({
      reporterId,
      reportedId: targetUserId,
      sessionId: sessionId || 'unknown',
      reason: reason || 'Inappropriate behavior',
      comment: comment || '',
      evidenceSnapshot: evidence
    });

    // Also automatically add a mutual block so they never meet again (FR-SAFE-02)
    memoryStore.addBlock(reporterId, targetUserId);

    return report;
  }

  blockUser({ userId, targetUserId }) {
    if (!userId || !targetUserId) {
      throw new Error('User ID and target user ID are required');
    }

    memoryStore.addBlock(userId, targetUserId);
    return { success: true, blockedId: targetUserId };
  }
}

export const safetyManager = new SafetyManager();
