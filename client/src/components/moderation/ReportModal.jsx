import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { api } from '../../services/api';
import { Flag, X, AlertTriangle } from 'lucide-react';

const REPORT_REASONS = [
  'Inappropriate Behavior or Nudity',
  'Harassment or Hate Speech',
  'Suspected Bot or Automated Spam',
  'Underage User (< 18)',
  'Dangerous or Illegal Content',
  'Other Policy Violation'
];

export function ReportModal({ isOpen, onClose }) {
  const { sessionId, partnerId, skipPartner } = useChat();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [comment, setComment] = useState('');
  const [blockAlso, setBlockAlso] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.submitReport({
        reportedId: partnerId,
        sessionId,
        reason,
        comment
      });

      if (blockAlso && partnerId) {
        await api.blockUser(partnerId);
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        // Skip current partner automatically after report
        skipPartner(true);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-title">
          <Flag size={22} color="#ef4444" />
          <span>Report Partner</span>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>
              Report submitted successfully.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Our moderation team has received the report and rolling evidence snapshot. Skipping to a new stranger...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Reason for reporting</label>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe what occurred during the session..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                id="blockPartnerCheck"
                checked={blockAlso}
                onChange={(e) => setBlockAlso(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="blockPartnerCheck" style={{ cursor: 'pointer', color: '#cbd5e1' }}>
                Block this stranger so we never match again (FR-SAFE-02)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={onClose}
                style={{ flex: 1, padding: '0.65rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ flex: 1, background: '#ef4444' }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
