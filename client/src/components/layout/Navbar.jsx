import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Sparkles, MessageCircle } from 'lucide-react';
import { DoodleAvatarHead, DoodleLogoIcon } from '../doodles/DoodleCharacter';

export function Navbar() {
  const { user, setIsProfileModalOpen } = useAuth();
  const { currentView, setCurrentView, isChatOpen, setIsChatOpen, chatStatus, unreadCount } = useChat();

  return (
    <header className="app-navbar">
      {/* Left: Hand-Drawn Doodle Logo */}
      <div
        className="navbar-logo"
        onClick={() => {
          setCurrentView('lobby');
          window.dispatchEvent(new CustomEvent('replay-loader'));
        }}
        title="O P Omegle - Click to replay intro"
      >
        <DoodleLogoIcon size={34} />
        <span className="navbar-brand-name">O P Omegle</span>
      </div>

      {/* Right Controls: Chat (in-call) & Profile Avatar */}
      <div className="navbar-right">
        {currentView === 'call' && (
          <button
            className={`navbar-icon-btn ${isChatOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title={unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : "Toggle Text Chat"}
            aria-label="Toggle Text Chat"
          >
            <MessageCircle size={18} />
            {unreadCount > 0 && (
              <span className="navbar-unread-green-badge" title="Someone sent you a message">
                <span className="navbar-unread-pulse-ring" />
              </span>
            )}
          </button>
        )}

        {/* User Profile Avatar */}
        <button
          className="profile-avatar-btn"
          onClick={() => setIsProfileModalOpen(true)}
          title={user?.displayName || 'My Profile'}
        >
          <DoodleAvatarHead seed={user?.avatar || 'you'} size={32} />
        </button>
      </div>
    </header>
  );
}
