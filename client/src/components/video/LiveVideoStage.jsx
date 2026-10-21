import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sliders,
  LogOut,
  ArrowLeftRight,
  X,
  Camera,
  UserX,
  Sparkles,
  AlertCircle,
  SwitchCamera
} from 'lucide-react';
import {
  DoodleStranger,
  DoodleCameraOff,
  DoodleSearching,
  DoodleAvatarHead
} from '../doodles/DoodleCharacter';

export function LiveVideoStage({ webrtc }) {
  const {
    callDuration,
    formatLiveDuration,
    switchUser,
    endCall,
    chatStatus,
    searchDuration,
    partnerLeftInfo,
    partnerMediaState,
    findNextStranger,
    clearInterestsAndSearch,
    interests,
    incomingMessageBanner,
    setIncomingMessageBanner,
    setIsChatOpen,
    isChatOpen
  } = useChat();

  const { user, setIsSettingsModalOpen } = useAuth();
  const {
    localStream,
    remoteStream,
    isRemoteVideoLive,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    connectionState,
    toggleMute,
    toggleVideo,
    facingMode,
    switchCamera
  } = webrtc;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Auto-search countdown after partner leaves
  const [partnerLeftCountdown, setPartnerLeftCountdown] = useState(5);
  const [isAutoSearchPaused, setIsAutoSearchPaused] = useState(false);

  useEffect(() => {
    let timer = null;
    if (chatStatus === 'partner_left' && !isAutoSearchPaused) {
      setPartnerLeftCountdown(5);
      timer = setInterval(() => {
        setPartnerLeftCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            findNextStranger();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPartnerLeftCountdown(5);
    }
    return () => clearInterval(timer);
  }, [chatStatus, isAutoSearchPaused, findNextStranger]);

  // Auto-dismiss incoming message notification toast
  useEffect(() => {
    if (incomingMessageBanner) {
      const timer = setTimeout(() => {
        setIncomingMessageBanner(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [incomingMessageBanner, setIncomingMessageBanner]);

  // Global Keyboard shortcuts: Space (skip/find next), M (mute), V (video), Esc (end)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (chatStatus === 'partner_left') {
          findNextStranger();
        } else if (chatStatus === 'matched') {
          switchUser();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'v' || e.key === 'V') {
        toggleVideo();
      } else if (e.key === 'Escape') {
        endCall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatStatus, findNextStranger, switchUser, toggleMute, toggleVideo, endCall]);

  // A feed is live when WebRTC is connected & remote video track is active & enabled
  const hasRemoteVideo = Boolean(
    remoteStream &&
    remoteStream.getVideoTracks().length > 0 &&
    remoteStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended')
  );

  const isRemoteLive = Boolean(
    connectionState === 'connected' &&
    (hasRemoteVideo || isRemoteVideoLive) &&
    !partnerMediaState?.isVideoOff &&
    chatStatus === 'matched'
  );

  const isLocalLive = Boolean(
    localStream &&
    !isVideoOff &&
    localStream.getVideoTracks().length > 0 &&
    localStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended')
  );

  // Bind local webcam feed
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (!videoEl) return;

    if (localStream) {
      if (videoEl.srcObject !== localStream) {
        videoEl.srcObject = localStream;
      }
      videoEl.play?.().catch(() => {});
    } else {
      videoEl.srcObject = null;
    }
  }, [localStream]);

  // Bind remote stranger feed once per session, ensuring prompt playback
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;

    if (remoteStream && remoteStream.getTracks().length > 0) {
      if (videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
      }
      const attemptPlay = () => {
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[LiveVideo] Autoplay fallback to muted:', err.message);
            videoEl.muted = true;
            videoEl.play().catch(() => {});

            const unmuteOnGesture = () => {
              if (videoEl) {
                videoEl.muted = false;
              }
              window.removeEventListener('click', unmuteOnGesture);
              window.removeEventListener('keydown', unmuteOnGesture);
              window.removeEventListener('touchstart', unmuteOnGesture);
            };
            window.addEventListener('click', unmuteOnGesture);
            window.addEventListener('keydown', unmuteOnGesture);
            window.addEventListener('touchstart', unmuteOnGesture);
          });
        }
      };
      attemptPlay();
      videoEl.onloadedmetadata = attemptPlay;
    } else if (!remoteStream || chatStatus !== 'matched') {
      videoEl.srcObject = null;
    }
  }, [remoteStream, chatStatus]);

  return (
    <div className="live-stage-container">
      {/* Top Floating P2P Connection Status Toast */}
      {connectionState === 'connecting' && chatStatus === 'matched' && (
        <div className="connection-toast info">
          <span className="clean-spinner-sm"></span>
          <span>Connecting direct video feed...</span>
        </div>
      )}
      {(connectionState === 'disconnected' || connectionState === 'failed') && chatStatus === 'matched' && (
        <div className="connection-toast warning">
          <AlertCircle size={14} />
          <span>Connection dropped • Reconnecting to stranger...</span>
        </div>
      )}

      {/* Incoming Message Notification Banner Pop-Up */}
      {incomingMessageBanner && !isChatOpen && (
        <div
          className="incoming-message-toast"
          onClick={() => {
            setIsChatOpen(true);
            setIncomingMessageBanner(null);
          }}
          role="status"
          aria-live="polite"
        >
          <div className="toast-left">
            <div className="toast-avatar-wrapper">
              <DoodleAvatarHead seed="stranger" size={28} />
              <span className="toast-green-dot" />
            </div>
            <div className="toast-text-block">
              <div className="toast-header-text">
                <span className="toast-sender-name">{incomingMessageBanner.sender}</span>
                <span className="toast-tag-note">New Message</span>
              </div>
              <div className="toast-message-body">
                {incomingMessageBanner.text}
              </div>
            </div>
          </div>
          <div className="toast-right">
            <span className="toast-reply-badge">Reply</span>
            <button
              type="button"
              className="toast-dismiss-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIncomingMessageBanner(null);
              }}
              aria-label="Dismiss message notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Dual Video Grid */}
      <div className="dual-video-grid">
        {/* Left Card: Remote Partner */}
        <div className={`video-card-wrapper remote-wrapper ${!isRemoteLive ? 'doodle-mode' : ''}`}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-surface"
            style={{
              opacity: isRemoteLive ? 1 : 0,
              pointerEvents: isRemoteLive ? 'auto' : 'none',
              zIndex: isRemoteLive ? 2 : 1
            }}
          />

          {/* Floating Pill: Stranger is Muted */}
          {chatStatus === 'matched' && partnerMediaState?.isAudioMuted && (
            <div className="remote-media-pill muted" title="Stranger's microphone is muted">
              <MicOff size={13} strokeWidth={2.5} />
              <span>Stranger is muted</span>
            </div>
          )}

          {/* Floating Pill: Stranger's Camera is Off */}
          {chatStatus === 'matched' && partnerMediaState?.isVideoOff && isRemoteLive && (
            <div className="remote-media-pill camera-off" title="Stranger's camera is turned off">
              <VideoOff size={13} strokeWidth={2.5} />
              <span>Stranger's camera is off</span>
            </div>
          )}

          <div
            className="doodle-surface-wrapper"
            style={{
              opacity: !isRemoteLive ? 1 : 0,
              pointerEvents: !isRemoteLive ? 'auto' : 'none',
              zIndex: !isRemoteLive ? 2 : 1
            }}
          >
            {/* STATE 1: Partner Left */}
            {chatStatus === 'partner_left' ? (
              <div className="partner-left-surface">
                <div className="partner-left-avatar-ring">
                  <DoodleAvatarHead seed="stranger" size={60} />
                  <span className="partner-left-badge-icon">
                    <UserX size={15} />
                  </span>
                </div>
                <h3 className="partner-left-title">Stranger has left the chat</h3>
                <p className="partner-left-subtitle">
                  {partnerLeftInfo?.duration > 0
                    ? `Conversation lasted ${formatLiveDuration(partnerLeftInfo.duration)}`
                    : 'The stranger has disconnected from this room.'}
                </p>

                <div className="partner-left-countdown-box">
                  <div className="countdown-label-row">
                    <span>Auto-searching next match in <strong>{partnerLeftCountdown}s</strong></span>
                    {!isAutoSearchPaused && (
                      <button
                        type="button"
                        className="pause-countdown-link"
                        onClick={() => setIsAutoSearchPaused(true)}
                      >
                        Pause
                      </button>
                    )}
                  </div>
                  <div className="countdown-progress-bar">
                    <div
                      className="countdown-progress-fill"
                      style={{ width: `${(partnerLeftCountdown / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="partner-left-actions-row">
                  <button
                    type="button"
                    className="find-next-primary-btn"
                    onClick={findNextStranger}
                  >
                    <ArrowLeftRight size={15} strokeWidth={2.5} />
                    <span>Find Next Stranger</span>
                    <kbd className="shortcut-kbd">Space</kbd>
                  </button>
                  <button
                    type="button"
                    className="cancel-lobby-btn"
                    onClick={endCall}
                  >
                    Return to Lobby
                  </button>
                </div>
              </div>
            ) : chatStatus === 'searching' && searchDuration >= 15 ? (
              /* STATE 2: No Users Found / Search Timeout */
              <div className="no-users-found-surface">
                <DoodleSearching className="doodle-graphic searching-animated" style={{ maxWidth: 110, maxHeight: 110 }} />
                <h3 className="no-users-title">No users found right now</h3>
                <p className="no-users-sub">
                  {interests.length > 0
                    ? `No one online matches #${interests.join(', #')} at this moment.`
                    : 'No available strangers in queue right now. You can keep waiting or try again.'}
                </p>

                <div className="no-users-actions">
                  {interests.length > 0 && (
                    <button
                      type="button"
                      className="clear-tags-btn"
                      onClick={clearInterestsAndSearch}
                    >
                      <Sparkles size={14} />
                      <span>Clear Tags & Match Anyone</span>
                    </button>
                  )}
                  <div className="no-users-btn-group">
                    <button
                      type="button"
                      className="keep-waiting-btn"
                      onClick={() => {}}
                    >
                      <span className="clean-spinner-sm"></span>
                      <span>Still Searching ({searchDuration}s)</span>
                    </button>
                    <button
                      type="button"
                      className="lobby-return-link-btn"
                      onClick={endCall}
                    >
                      Return to Lobby
                    </button>
                  </div>
                </div>
              </div>
            ) : chatStatus === 'searching' ? (
              /* STATE 3: Standard Searching */
              <div className="doodle-searching-box">
                <DoodleSearching className="doodle-graphic searching-animated" />
                <div className="doodle-caption-box">
                  <span className="clean-spinner"></span>
                  <span className="doodle-status-text">
                    Finding your next match
                    <span className="searching-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </span>
                  <span className="search-elapsed-badge">{searchDuration}s</span>
                </div>
                {interests.length > 0 && searchDuration >= 5 && (
                  <div className="search-tags-hint">
                    Looking for tags: <strong>#{interests.join(', #')}</strong>
                  </div>
                )}
              </div>
            ) : partnerMediaState?.isVideoOff ? (
              /* STATE 4: Stranger Deliberately Turned Off Camera */
              <>
                <DoodleStranger className="doodle-graphic" />
                <div className="doodle-caption-box">
                  <span className="doodle-status-text">Stranger's camera is off</span>
                </div>
              </>
            ) : (
              /* STATE 5: P2P Stream Connecting */
              <div className="doodle-searching-box">
                <DoodleSearching className="doodle-graphic searching-animated" style={{ maxWidth: 100, maxHeight: 100 }} />
                <div className="doodle-caption-box">
                  <span className="clean-spinner"></span>
                  <span className="doodle-status-text">Connecting video feed...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom-left pill badge: Doodle Avatar + Stranger */}
          <div className="video-author-badge">
            <DoodleAvatarHead seed="stranger" size={22} />
            <span className="badge-name-text">Stranger</span>
          </div>
        </div>

        {/* Right Card: Local User (You) */}
        <div className={`video-card-wrapper local-wrapper ${!isLocalLive ? 'doodle-mode' : ''}`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`video-surface ${isMirrored ? 'mirrored' : ''}`}
            style={{
              opacity: isLocalLive ? 1 : 0,
              pointerEvents: isLocalLive ? 'auto' : 'none',
              zIndex: isLocalLive ? 2 : 1
            }}
          />

          {/* Local Muted Alert Badge */}
          {isAudioMuted && (
            <div className="local-media-pill muted" title="Your microphone is muted">
              <MicOff size={13} strokeWidth={2.5} />
              <span>You are muted</span>
            </div>
          )}

          <div
            className="doodle-surface-wrapper"
            style={{
              opacity: !isLocalLive ? 1 : 0,
              pointerEvents: !isLocalLive ? 'auto' : 'none',
              zIndex: !isLocalLive ? 2 : 1
            }}
          >
            <DoodleCameraOff className="doodle-graphic" />
            <div className="doodle-caption-box">
              <span className="doodle-status-text">Your camera is turned off</span>
              <button
                type="button"
                className="doodle-enable-btn"
                onClick={toggleVideo}
              >
                <Camera size={14} />
                <span>Turn On Camera</span>
              </button>
            </div>
          </div>

          {/* Bottom-left pill badge: Doodle Avatar + You */}
          <div className="video-author-badge">
            <DoodleAvatarHead seed={user?.avatar || 'you'} size={22} />
            <span className="badge-name-text">You</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Controls Bar */}
      <div className="call-bottom-controls-bar">
        {/* Left: Live status & End button pill */}
        <div className="live-status-pill">
          {chatStatus === 'searching' ? (
            <div className="live-dot-indicator searching">
              <span className="pulsing-searching-dot"></span>
              <span className="live-text" style={{ color: '#d97706' }}>SEARCHING</span>
              <span className="search-pill-time">{searchDuration}s</span>
            </div>
          ) : chatStatus === 'partner_left' ? (
            <div className="live-dot-indicator partner-left">
              <span className="live-dot-static-gray"></span>
              <span className="live-text" style={{ color: '#64748b' }}>LEFT</span>
            </div>
          ) : (
            <div className="live-dot-indicator">
              <span className="pulsing-live-dot"></span>
              <span className="live-text">LIVE</span>
              <span className="live-timer">{formatLiveDuration(callDuration)}</span>
            </div>
          )}
          <button className="end-call-sub-btn" onClick={endCall} title="End Conversation (Esc)">
            <X size={14} strokeWidth={2.5} />
            <span>End</span>
          </button>
        </div>

        {/* Center: Circular media toggles and red exit button */}
        <div className="center-media-group">
          <button
            className={`control-circle-btn ${isAudioMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            title={isAudioMuted ? "Unmute Microphone (M)" : "Mute Microphone (M)"}
          >
            {isAudioMuted ? <MicOff size={19} /> : <Mic size={19} />}
          </button>

          <button
            className={`control-circle-btn ${isVideoOff ? 'disabled' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? "Turn Video On (V)" : "Turn Video Off (V)"}
          >
            {isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
          </button>

          {/* Switch / Flip Camera Button (Front vs Rear Camera) */}
          <button
            className={`control-circle-btn switch-camera-btn ${facingMode === 'environment' ? 'active-rear' : ''}`}
            onClick={switchCamera}
            title={facingMode === 'user' ? "Flip to Back Camera (Environment)" : "Flip to Front Camera (User)"}
            aria-label="Rotate / Switch Camera"
          >
            <SwitchCamera size={19} />
          </button>

          <button
            className="control-circle-btn settings-btn"
            onClick={() => setIsSettingsModalOpen(true)}
            title="Audio & Video Settings"
          >
            <Sliders size={18} />
          </button>

          <button
            className="control-rounded-btn red-exit-btn"
            onClick={endCall}
            title="Leave Call (Esc)"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Right: Switch User ⇄ Pill Button */}
        <button
          className="switch-user-btn"
          onClick={chatStatus === 'partner_left' ? findNextStranger : switchUser}
          title="Switch User / Next Stranger (Press Spacebar)"
        >
          <span>{chatStatus === 'partner_left' ? 'Find Next' : 'Switch User'}</span>
          <ArrowLeftRight size={17} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
