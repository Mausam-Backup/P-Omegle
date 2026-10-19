import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Globe, Bell, User, ArrowRight } from 'lucide-react';

export function ConvooTopBar({ onOpenAuth, user }) {
  const { skipPartner } = useChat();

  return (
    <div className="convoo-topbar">
      {/* Next Room [spacebar] pill */}
      <button
        className="next-room-btn"
        onClick={() => skipPartner(true)}
        title="Skip to next room (or press Spacebar)"
      >
        <span>Next Room <span className="spacebar-tag">[spacebar]</span></span>
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>

      {/* Top right icon utilities */}
      <div className="topbar-icons">
        <button className="topbar-circle-btn" title="Region & Language">
          <Globe size={18} />
        </button>

        <button className="topbar-circle-btn" title="Notifications">
          <Bell size={18} />
        </button>

        <button
          className="topbar-circle-btn user-avatar"
          onClick={onOpenAuth}
          title={user?.email || 'Account'}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="avatar-img" />
          ) : (
            <User size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
