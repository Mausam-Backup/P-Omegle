import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Check, Zap, Globe, Shield, Video } from 'lucide-react';

export function ProModal() {
  const { user, isProModalOpen, setIsProModalOpen, togglePro } = useAuth();

  if (!isProModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsProModalOpen(false)}>
      <div className="modal-card pro-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon-btn" onClick={() => setIsProModalOpen(false)}>
          <X size={18} />
        </button>

        <div className="pro-modal-header">
          <div className="pro-badge-icon">
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h2 className="pro-modal-title">Upgrade to Pro</h2>
          <p className="pro-modal-subtitle">
            Supercharge your video conversations with zero wait time, 1080p crystal clear streams, and country filters.
          </p>
        </div>

        <div className="pro-features-list">
          <div className="pro-feature-item">
            <div className="feature-icon-box"><Zap size={18} color="#6366f1" /></div>
            <div>
              <div className="feature-title">Instant Matching</div>
              <div className="feature-desc">Skip queues with priority routing directly to waiting partners.</div>
            </div>
          </div>

          <div className="pro-feature-item">
            <div className="feature-icon-box"><Video size={18} color="#6366f1" /></div>
            <div>
              <div className="feature-title">1080p Ultra HD Video</div>
              <div className="feature-desc">Uncapped high-bitrate WebRTC video and spatial audio.</div>
            </div>
          </div>

          <div className="pro-feature-item">
            <div className="feature-icon-box"><Globe size={18} color="#6366f1" /></div>
            <div>
              <div className="feature-title">Country & Region Filter</div>
              <div className="feature-desc">Choose specific countries or global matching anytime.</div>
            </div>
          </div>
        </div>

        <button
          className="pro-activate-btn"
          onClick={() => {
            togglePro();
            setIsProModalOpen(false);
          }}
        >
          {user?.isPro ? 'Deactivate Pro' : 'Activate Pro Membership'}
        </button>
      </div>
    </div>
  );
}
