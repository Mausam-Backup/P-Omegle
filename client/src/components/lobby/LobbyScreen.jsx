import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Video, Mic, MicOff, VideoOff, Users, Plus, X, ShieldCheck } from 'lucide-react';
import { DoodleCameraOff, DoodleAvatarHead } from '../doodles/DoodleCharacter';
import { DoodleCrowdLayer } from '../doodles/DoodleCrowdLayer';

const SUGGESTED_INTERESTS = ['tech', 'design', 'music', 'gaming', 'travel', 'crypto', 'art'];

export function LobbyScreen({ webrtc }) {
  const { startCall, interests, setInterests, stats } = useChat();
  const { user, setIsProfileModalOpen } = useAuth();
  const { localStream, isAudioMuted, isVideoOff, toggleMute, toggleVideo } = webrtc;

  const previewVideoRef = useRef(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (previewVideoRef.current && localStream) {
      if (previewVideoRef.current.srcObject !== localStream) {
        previewVideoRef.current.srcObject = localStream;
      }
      previewVideoRef.current.play?.().catch(() => {});
    }
  }, [localStream, isVideoOff]);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !interests.includes(clean) && interests.length < 5) {
      setInterests([...interests, clean]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setInterests(interests.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const isPreviewLive = Boolean(localStream && !isVideoOff);

  return (
    <div className="lobby-wrapper">
      <div className="lobby-card">
        {/* Left Side: Live Camera Test & Mic Checks */}
        <div className="lobby-preview-section">
          <div className="lobby-video-box">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="lobby-video-element"
              style={{ display: isPreviewLive ? 'block' : 'none' }}
            />
            {!isPreviewLive && (
              <div className="lobby-video-placeholder">
                <div className="lobby-placeholder-doodle">
                  <DoodleCameraOff style={{ width: '100%', height: '100%', maxWidth: 140, maxHeight: 140 }} />
                </div>
                <div className="lobby-camera-status-text">
                  Camera is turned off
                </div>
              </div>
            )}

            {/* In-box controls */}
            <div className="lobby-preview-controls">
              <button
                type="button"
                className={`preview-pill-btn ${isAudioMuted ? 'off' : ''}`}
                onClick={toggleMute}
                aria-label={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isAudioMuted ? <MicOff size={15} strokeWidth={2.2} /> : <Mic size={15} strokeWidth={2.2} />}
                <span>{isAudioMuted ? 'Muted' : 'Mic On'}</span>
              </button>

              <button
                type="button"
                className={`preview-pill-btn ${isVideoOff ? 'off' : ''}`}
                onClick={toggleVideo}
                aria-label={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
              >
                {isVideoOff ? <VideoOff size={15} strokeWidth={2.2} /> : <Video size={15} strokeWidth={2.2} />}
                <span>{isVideoOff ? 'Video Off' : 'Camera On'}</span>
              </button>
            </div>
          </div>

          <div className="lobby-privacy-note">
            <ShieldCheck size={16} color="#10b981" />
            <span>P2P Encrypted • No recordings stored</span>
          </div>
        </div>

        {/* Right Side: Profile & Room Configuration */}
        <div className="lobby-settings-section">
          {/* User Profile Card */}
          <div className="lobby-user-header">
            <DoodleAvatarHead seed={user?.avatar || 'you'} size={48} />
            <div style={{ flex: 1 }}>
              <div className="lobby-user-name">
                {user?.displayName || "You"}
                {user?.isPro && <span className="pro-chip">PRO</span>}
              </div>
              <div className="lobby-user-sub">
                {user?.isGuest ? 'Guest User' : user?.email} •{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Interests section */}
          <div className="lobby-interests-group">
            <label className="lobby-group-label">Match Interests (Optional)</label>
            <div className="lobby-tags-container">
              {interests.map((tag) => (
                <span key={tag} className="lobby-tag-pill">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}

              {interests.length < 5 && (
                <input
                  type="text"
                  className="lobby-tag-input"
                  placeholder="Add interest (e.g. music)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              )}
            </div>

            {/* Quick suggested chips */}
            <div className="lobby-suggested-row">
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Suggestions:</span>
              {SUGGESTED_INTERESTS.filter(t => !interests.includes(t)).slice(0, 5).map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="suggested-chip"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Online count */}
          <div className="lobby-stats-row">
            <Users size={16} color="#6366f1" />
            <span><strong>{stats.onlineUsers.toLocaleString()}</strong> people ready to chat now</span>
          </div>

          {/* Start Call CTA */}
          <button className="start-call-cta-btn" onClick={startCall}>
            <Video size={20} />
            <span>Start Video Call</span>
          </button>
        </div>
      </div>

      {/* Dynamic Animated Doodle Crowd Layer (MiroFish style) */}
      <DoodleCrowdLayer />
    </div>
  );
}
