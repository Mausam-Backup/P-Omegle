import React from 'react';
import { ShieldAlert, Flag } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function SafetyBanner({ onOpenReport }) {
  const { chatStatus } = useChat();

  return (
    <div className="safety-banner">
      <div className="safety-notice">
        <ShieldAlert size={16} color="#818cf8" />
        <span>
          <strong>Safety Advisory:</strong> Do not share personal passwords, phone numbers, or social media handles. All interactions are governed by our 18+ Community Guidelines.
        </span>
      </div>

      {chatStatus === 'matched' && (
        <button
          className="chip-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          onClick={onOpenReport}
        >
          <Flag size={13} />
          <span>Report Partner</span>
        </button>
      )}
    </div>
  );
}
