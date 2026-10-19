import { memoryStore } from '../../store/memoryStore.js';
import { matchmakingEngine } from '../matchmaking/matchmakingEngine.js';

class ModerationService {
  getReportQueue() {
    return memoryStore.getReports();
  }

  takeAction({ moderatorId, reportId, targetUserId, action, reason }) {
    // Actions: 'WARN', 'SUSPEND', 'BAN', 'DISMISS'
    if (reportId) {
      memoryStore.updateReportStatus(reportId, action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED');
    }

    const user = memoryStore.getUser(targetUserId);
    if (!user) {
      return { success: true, message: `Action ${action} applied to user ${targetUserId}` };
    }

    if (action === 'BAN') {
      user.isBanned = true;
      // Kick out of queue and clear session
      matchmakingEngine.leaveQueue(targetUserId);
      memoryStore.clearUserSession(targetUserId);
    } else if (action === 'SUSPEND') {
      user.isSuspended = true;
      matchmakingEngine.leaveQueue(targetUserId);
      memoryStore.clearUserSession(targetUserId);
    }

    return {
      success: true,
      targetUserId,
      action,
      userState: {
        isBanned: user.isBanned,
        isSuspended: user.isSuspended
      }
    };
  }
}

export const moderationService = new ModerationService();
