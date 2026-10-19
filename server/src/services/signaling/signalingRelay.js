import { memoryStore } from '../../store/memoryStore.js';
import { sessionManager } from '../session/sessionManager.js';

class SignalingRelay {
  /**
   * Validate and forward a WebRTC or text signal between session participants.
   * Rejects signals if session is invalid or ended (FR-SESS-02).
   */
  processSignal({ sessionId, senderId, type, payload }) {
    if (!sessionId || !senderId) {
      return { allowed: false, error: 'Missing session or sender ID' };
    }

    const session = sessionManager.getSession(sessionId);
    if (!session || session.state === 'ENDED') {
      return { allowed: false, error: 'Session has ended or does not exist' };
    }

    if (!sessionManager.isParticipant(sessionId, senderId)) {
      return { allowed: false, error: 'Unauthorized sender for this session' };
    }

    const partnerId = sessionManager.getPartnerId(sessionId, senderId);
    if (!partnerId) {
      return { allowed: false, error: 'Partner not found' };
    }

    // For chat messages, add to rolling evidence snapshot in memory (for abuse reporting)
    if (type === 'chat_message') {
      memoryStore.addEvidence(sessionId, {
        senderId,
        type: 'chat_message',
        content: payload?.text?.slice(0, 500) || '',
        timestamp: Date.now()
      });
    }

    return {
      allowed: true,
      partnerId,
      forwardEnvelope: {
        sessionId,
        senderId,
        type,
        payload,
        timestamp: Date.now()
      }
    };
  }
}

export const signalingRelay = new SignalingRelay();
