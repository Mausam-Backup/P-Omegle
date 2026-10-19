import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Shield, X, AlertTriangle, CheckCircle, Ban, Clock } from 'lucide-react';

export function ModeratorDashboard({ isOpen, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getModerationReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId, targetUserId, action) => {
    setActionLoading(reportId);
    try {
      await api.takeModerationAction(targetUserId, action, `Action ${action} by moderator`, reportId);
      await loadReports();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 750 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-title">
          <Shield size={22} color="#818cf8" />
          <span>Moderator Control Center (FR-SAFE-04)</span>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Active report audit queue with rolling evidence snapshots. Review and apply sanctions immediately.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#10b981' }}>
            <CheckCircle size={36} style={{ margin: '0 auto 0.5rem auto' }} />
            <p>Queue is empty! All reports have been resolved.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#f87171' }}>{rep.reason}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Status: <strong style={{ color: rep.status === 'PENDING' ? '#fbbf24' : '#10b981' }}>{rep.status}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(rep.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <strong>Target User:</strong> <span style={{ fontFamily: 'monospace' }}>{rep.reportedId}</span>
                  {rep.comment && <p style={{ marginTop: '0.25rem', color: '#94a3b8' }}><em>"{rep.comment}"</em></p>}
                </div>

                {/* Evidence snapshot */}
                {rep.evidenceSnapshot && rep.evidenceSnapshot.length > 0 && (
                  <div style={{ background: '#020617', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Rolling Evidence Snapshot:</span>
                    <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {rep.evidenceSnapshot.slice(-3).map((e, idx) => (
                        <div key={idx} style={{ color: e.senderId === rep.reportedId ? '#60a5fa' : '#94a3b8' }}>
                          [{new Date(e.timestamp).toLocaleTimeString()}] {e.senderId === rep.reportedId ? 'Target' : 'Reporter'}: {e.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {rep.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      className="chip-btn"
                      style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                      onClick={() => handleAction(rep.id, rep.reportedId, 'SUSPEND')}
                      disabled={actionLoading === rep.id}
                    >
                      <Clock size={13} style={{ marginRight: 4 }} /> Suspend
                    </button>
                    <button
                      className="chip-btn"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => handleAction(rep.id, rep.reportedId, 'BAN')}
                      disabled={actionLoading === rep.id}
                    >
                      <Ban size={13} style={{ marginRight: 4 }} /> Ban User
                    </button>
                    <button
                      className="chip-btn"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => handleAction(rep.id, rep.reportedId, 'DISMISS')}
                      disabled={actionLoading === rep.id}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
