import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Video, MessageSquare, Shield, User, LogOut } from 'lucide-react';

export function Header({ onOpenModerator, onOpenReport }) {
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const { stats, chatStatus, stopSearch } = useChat();

  return (
    <header className="app-header">
      {/* Brand Logo */}
      <div className="logo-container" onClick={stopSearch}>
        <div className="logo-icon">
          <Video size={20} />
        </div>
        <span className="logo-text">Omegle</span>
      </div>

      {/* Online Users Count (FR-OME-09) */}
      <div className="online-pill" title="Live active users across platform">
        <span className="pulsing-dot"></span>
        <span>{stats.onlineUsers?.toLocaleString() || '1'} online now</span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Moderator Dashboard Button (if moderator) */}
        {user?.isModerator && (
          <button
            className="chip-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            onClick={onOpenModerator}
          >
            <Shield size={14} color="#818cf8" />
            <span>Mod Queue</span>
          </button>
        )}

        {/* User Account / Login Button */}
        {user && !user.isGuest ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user.email.split('@')[0]}</span>
            <button className="control-icon-btn" onClick={logout} title="Log Out" style={{ width: 34, height: 34 }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setIsAuthModalOpen(true)}
          >
            <User size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
