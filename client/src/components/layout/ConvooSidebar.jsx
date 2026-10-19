import React from 'react';
import { useChat } from '../../context/ChatContext';

export function ConvooSidebar() {
  const { currentLocation, currentIp, callDuration, formatDuration, chatStatus } = useChat();

  const formattedTimer = formatDuration(callDuration > 0 ? callDuration : 2047); // fallback initial aesthetic

  return (
    <aside className="convoo-sidebar">
      {/* Brand Pill Logo */}
      <div className="convoo-brand-pill">
        <span className="brand-logo-text">convoo</span>
      </div>

      <div className="sidebar-scroll-area">
        {/* Right now section */}
        <div className="sidebar-section-title">Right now</div>

        {/* Active room card with gradient */}
        <div className="active-room-card">
          <div className="room-title">
            {currentLocation} [{formattedTimer}]
          </div>
          <div className="room-ip">{currentIp}</div>
        </div>

        {/* Secondary Right now items */}
        <div className="history-item">
          <div className="history-title">Kansas, USA [00:06:12]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">New York, USA [00:00:12]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">Bristol, UK [00:34:07]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">Tokyo, JP [01:22:15]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        {/* Last 7 days section */}
        <div className="sidebar-section-title" style={{ marginTop: '1.25rem' }}>
          Last 7 days
        </div>

        <div className="history-item">
          <div className="history-title">Rome, IT [00:11:07]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">Cairo, EG [00:12:12]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">Istanbul, TR [01:12:07]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>

        <div className="history-item">
          <div className="history-title">Bangkok, TH [00:04:02]</div>
          <div className="history-ip">12.123.45.6</div>
        </div>
      </div>
    </aside>
  );
}
