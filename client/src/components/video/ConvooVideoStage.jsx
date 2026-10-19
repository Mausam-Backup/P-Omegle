import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';

export function ConvooVideoStage({ webrtc }) {
  const { partnerName, skipPartner, chatStatus } = useChat();
  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    connectionState,
    toggleMute,
    toggleVideo
  } = webrtc;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="convoo-video-column">
      {/* Top Video: Remote / Stranger */}
      <div className="video-card remote-card">
        {remoteStream && connectionState === 'connected' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
        ) : (
          <div className="video-placeholder remote-placeholder">
            {/* Elegant high-res reference avatar mirroring Image 1 */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
              alt="Remote Partner"
              className="placeholder-video-img"
            />
            {chatStatus === 'searching' && (
              <div className="connecting-badge">
                <span className="pulsing-circle"></span>
                <span>Connecting with {partnerName}...</span>
              </div>
            )}
          </div>
        )}

        {/* Overlay pill bottom center: Partner name */}
        <div className="video-user-pill">
          <span>{partnerName || 'Love Quinn'}</span>
        </div>
      </div>

      {/* Bottom Video: You / Local */}
      <div className="video-card local-card">
        {localStream && !isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`video-element ${isMirrored ? 'mirrored' : ''}`}
          />
        ) : (
          <div className="video-placeholder local-placeholder">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80"
              alt="You"
              className="placeholder-video-img"
            />
          </div>
        )}

        {/* Overlay pill bottom center: You */}
        <div className="video-user-pill">
          <span>You</span>
        </div>
      </div>

      {/* Floating Bottom Media Bar (Mic, Cam, Hangup) */}
      <div className="floating-action-bar">
        <button
          className={`action-circle-btn ${isAudioMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button
          className={`action-circle-btn ${isVideoOff ? 'video-off' : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? 'Enable Camera' : 'Disable Camera'}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        <button
          className="action-circle-btn red-hangup"
          onClick={() => skipPartner(true)}
          title="End Call / Next Partner"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}
