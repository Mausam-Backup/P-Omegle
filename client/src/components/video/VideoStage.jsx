import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Mic, MicOff, Video, VideoOff, FlipHorizontal, ArrowLeftRight, Maximize, User } from 'lucide-react';

export function VideoStage({ webrtc }) {
  const { chatStatus } = useChat();
  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    isSwapped,
    connectionState,
    toggleMute,
    toggleVideo,
    toggleMirror,
    toggleSwap
  } = webrtc;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const containerRef = useRef(null);

  // Bind local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Bind remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const renderVideoBox = (isRemote) => {
    if (isRemote) {
      return (
        <div className="video-frame-container" key="remote-box">
          <div className="video-overlay-badge stranger">
            Stranger {connectionState === 'connected' && '• Live'}
          </div>

          {remoteStream && connectionState === 'connected' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="video-feed"
            />
          ) : (
            <div className="placeholder-avatar">
              <User size={48} strokeWidth={1.5} />
              <span style={{ fontSize: '0.85rem' }}>
                {chatStatus === 'matched' ? 'Connecting media...' : 'Waiting for partner...'}
              </span>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="video-frame-container" key="local-box">
          <div className="video-overlay-badge you">
            You {isAudioMuted && '• Muted'}
          </div>

          {localStream && !isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`video-feed ${isMirrored ? 'mirrored' : ''}`}
            />
          ) : (
            <div className="placeholder-avatar">
              <User size={48} strokeWidth={1.5} />
              <span style={{ fontSize: '0.85rem' }}>
                {isVideoOff ? 'Camera Turned Off' : 'Your Camera'}
              </span>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="stage-container" ref={containerRef}>
      <div className="video-grid">
        {isSwapped ? [renderVideoBox(false), renderVideoBox(true)] : [renderVideoBox(true), renderVideoBox(false)]}
      </div>

      {/* Floating Media Controls (FR-OME-11) */}
      <div className="media-controls-bar">
        <button
          className={`control-icon-btn ${isAudioMuted ? 'active-off' : ''}`}
          onClick={toggleMute}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          className={`control-icon-btn ${isVideoOff ? 'active-off' : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        <button
          className="control-icon-btn"
          onClick={toggleMirror}
          title="Mirror Self View"
        >
          <FlipHorizontal size={18} />
        </button>

        <button
          className="control-icon-btn"
          onClick={toggleSwap}
          title="Swap Local and Stranger Feeds"
        >
          <ArrowLeftRight size={18} />
        </button>

        <button
          className="control-icon-btn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
}
