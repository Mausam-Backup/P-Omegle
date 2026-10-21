import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Zap, Video, Globe } from 'lucide-react';

export function ProModal() {
  const { isProModalOpen, setIsProModalOpen } = useAuth();

  if (!isProModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsProModalOpen(false)}>
      <div className="pro-modal-card-clean" onClick={(e) => e.stopPropagation()}>
        {/* Ink-styled Close Button */}
        <button
          className="pro-modal-close-btn"
          onClick={() => setIsProModalOpen(false)}
          aria-label="Close modal"
        >
          <X size={17} strokeWidth={2.5} />
        </button>

        {/* Handcrafted Doodle Pro Icon (Crown Avatar with Sunglasses) */}
        <div className="pro-clean-icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="pro-doodle-svg">
            {/* Outer Doodle Circle */}
            <circle cx="40" cy="40" r="36" fill="#fef08a" stroke="#0f172a" strokeWidth="2.75" />
            
            {/* Hand-Drawn Sparkle Radiations */}
            <path d="M12 24 L6 20" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M68 24 L74 20" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 7 L40 2" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

            {/* Doodle Face */}
            <ellipse cx="40" cy="44" rx="22" ry="24" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            
            {/* Cute Crown on Top */}
            <path
              d="M26 28 L30 16 L40 22 L50 16 L54 28 Z"
              fill="#ff4949"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="30" cy="15" r="2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="40" cy="21" r="2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="50" cy="15" r="2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />

            {/* Cool Black Sunglasses */}
            <rect x="24" y="38" width="13" height="11" rx="3" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
            <rect x="43" y="38" width="13" height="11" rx="3" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
            <line x1="37" y1="41" x2="43" y2="41" stroke="#0f172a" strokeWidth="2.5" />
            {/* Glasses glare */}
            <line x1="26" y1="40" x2="33" y2="47" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="45" y1="40" x2="52" y2="47" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

            {/* Confident Smile */}
            <path d="M34 56 Q40 61 47 55" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Title & Coming Soon Pill */}
        <h2 className="pro-clean-title">Pro Plan</h2>
        <div className="pro-clean-badge">COMING SOON</div>

        <p className="pro-clean-desc">
          Premium matchmaking features and Ultra HD video will be available soon.
        </p>

        {/* Hand-drawn Feature Chips with solid ink icons */}
        <div className="pro-clean-chips-grid">
          <div className="pro-clean-chip">
            <Zap size={16} strokeWidth={2.4} color="#0f172a" />
            <span>Instant Priority Matching</span>
          </div>
          <div className="pro-clean-chip">
            <Video size={16} strokeWidth={2.4} color="#0f172a" />
            <span>1080p Ultra HD Video</span>
          </div>
          <div className="pro-clean-chip">
            <Globe size={16} strokeWidth={2.4} color="#0f172a" />
            <span>Country & Region Filters</span>
          </div>
        </div>

        {/* Solid Black Tactile Done Button */}
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

export default ProModal;
