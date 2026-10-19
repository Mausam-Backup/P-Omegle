import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Sparkles, MessageCircle } from 'lucide-react';
import { DoodleAvatarHead, DoodleLogoIcon } from '../doodles/DoodleCharacter';

export function Navbar() {
  const { user, setIsProfileModalOpen, setIsProModalOpen } = useAuth();
  const { currentView, setCurrentView, isChatOpen, setIsChatOpen, chatStatus } = useChat();

  return (
    <header className="app-navbar">
      {/* Left: Hand-Drawn Doodle Logo */}
      <div className="navbar-logo" onClick={() => setCurrentView('lobby')}>
        <DoodleLogoIcon size={34} />
        <span className="navbar-brand-name">VideoChat</span>
      </div>

      {/* Right Controls: Pro Pill & Profile Avatar */}
      <div className="navbar-right">
        {currentView === 'call' && (
          <button
            className={`navbar-icon-btn ${isChatOpen ? 'active' : ''}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle Text Chat"
          >
            <MessageCircle size={18} />
          </button>
        )}

        {/* Pro Pill */}
        <button
          className="pro-badge-btn"
          onClick={() => setIsProModalOpen(true)}
          title="Pro Membership"
        >
          <span>Pro</span>
          <Sparkles size={14} className="pro-sparkle" />
        </button>

        {/* User Profile Avatar */}
        <button
          className="profile-avatar-btn"
          onClick={() => setIsProfileModalOpen(true)}
          title={user?.displayName || 'My Profile'}
        >
          <DoodleAvatarHead seed="you" size={32} />
        </button>
      </div>
    </header>
  );
}
