import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Zap, Video, Globe } from 'lucide-react';

export function ProModal() {
  const { isProModalOpen, setIsProModalOpen } = useAuth();

  if (!isProModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsProModalOpen(false)}>
      <div className="pro-modal-card-clean" onClick={(e) => e.stopPropagation()}>
        <button
          className="pro-modal-close-btn"
          onClick={() => setIsProModalOpen(false)}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Top Icon Badge */}
        <div className="pro-clean-icon-wrap">
          <Sparkles size={26} className="pro-clean-sparkle" />
        </div>

        {/* Title & Coming Soon Pill */}
        <h2 className="pro-clean-title">Pro Plan</h2>
        <div className="pro-clean-badge">Coming Soon</div>

        <p className="pro-clean-desc">
          Premium matchmaking features and Ultra HD video will be available soon.
        </p>

        {/* Minimalist Feature Chips */}
        <div className="pro-clean-chips-grid">
          <div className="pro-clean-chip">
            <Zap size={15} color="#4f46e5" />
            <span>Instant Priority Matching</span>
          </div>
          <div className="pro-clean-chip">
            <Video size={15} color="#4f46e5" />
            <span>1080p Ultra HD Video</span>
          </div>
          <div className="pro-clean-chip">
            <Globe size={15} color="#4f46e5" />
            <span>Country & Region Filters</span>
          </div>
        </div>

        {/* Clean Close Action */}
        <button
          type="button"
          className="pro-clean-done-btn"
          onClick={() => setIsProModalOpen(false)}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
