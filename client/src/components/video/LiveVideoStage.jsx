import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, Sliders, LogOut, ArrowLeftRight, X, Camera } from 'lucide-react';
import { DoodleStranger, DoodleCameraOff, DoodleSearching, DoodleAvatarHead } from '../doodles/DoodleCharacter';

export function LiveVideoStage({ webrtc }) {
  const { callDuration, formatLiveDuration, switchUser, endCall, chatStatus } = useChat();
  const { setIsSettingsModalOpen } = useAuth();
  const {
    localStream,
    remoteStream,
    isRemoteVideoLive,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    toggleMute,
    toggleVideo
  } = webrtc;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // A feed is live when remote video track is active & enabled
  const isRemoteLive = Boolean(remoteStream && isRemoteVideoLive);

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

  // Bind remote stranger feed once per session, avoiding pipeline resets
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;

    if (remoteStream) {
      if (videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
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
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [remoteStream]);

  return (
    <div className="live-stage-container">
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

          <div
            className="doodle-surface-wrapper"
            style={{
              opacity: !isRemoteLive ? 1 : 0,
              pointerEvents: !isRemoteLive ? 'auto' : 'none',
              zIndex: !isRemoteLive ? 2 : 1
            }}
          >
            {chatStatus === 'searching' ? (
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
                </div>
              </div>
            ) : (
              <>
                <DoodleStranger className="doodle-graphic" />
                <div className="doodle-caption-box">
                  <span className="doodle-status-text">Stranger's camera is off</span>
                </div>
              </>
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
            <DoodleAvatarHead seed="you" size={22} />
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
              <span className="live-text" style={{ color: '#d97706' }}>CONNECTING</span>
            </div>
          ) : (
            <div className="live-dot-indicator">
              <span className="pulsing-live-dot"></span>
              <span className="live-text">LIVE</span>
              <span className="live-timer">{formatLiveDuration(callDuration)}</span>
            </div>
          )}
          <button className="end-call-sub-btn" onClick={endCall} title="End Conversation">
            <X size={14} strokeWidth={2.5} />
            <span>End</span>
          </button>
        </div>

        {/* Center: Circular media toggles and red exit button */}
        <div className="center-media-group">
          <button
            className={`control-circle-btn ${isAudioMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isAudioMuted ? <MicOff size={19} /> : <Mic size={19} />}
          </button>

          <button
            className={`control-circle-btn ${isVideoOff ? 'disabled' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
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
            title="Leave Call"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Right: Switch User ⇄ Pill Button */}
        <button
          className="switch-user-btn"
          onClick={switchUser}
          title="Switch User (Press Spacebar)"
        >
          <span>Switch User</span>
          <ArrowLeftRight size={17} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
