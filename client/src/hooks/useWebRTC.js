import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { api } from '../services/api';

/**
 * Creates an animated canvas video track as a graceful fallback
 * when a physical camera device is unavailable or locked by another browser tab.
 */
function createFallbackVideoTrack(label = 'You') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  let angle = 0;

  const draw = () => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing circle
    angle = (angle + 0.05) % (Math.PI * 2);
    const pulse = Math.sin(angle) * 8;

    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(320, 200, 70 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(320, 180, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(320, 250, 48, Math.PI, 0, true);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 320, 330);
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Live Video Feed', 320, 360);
  };

  draw();
  const interval = setInterval(draw, 66); // ~15 fps
  const stream = canvas.captureStream(15);
  const track = stream.getVideoTracks()[0];
  if (track) {
    const origStop = track.stop.bind(track);
    track.stop = () => {
      clearInterval(interval);
      origStop();
    };
  }
  return track;
}

export function useWebRTC() {
  const { sessionId, peerRole, chatStatus, sendWs, registerSignalListener } = useChat();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRemoteVideoLive, setIsRemoteVideoLive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const [connectionState, setConnectionState] = useState('new');

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const sendWsRef = useRef(sendWs);
  sendWsRef.current = sendWs;

  const registerSignalListenerRef = useRef(registerSignalListener);
  registerSignalListenerRef.current = registerSignalListener;

  // Auto-acquire camera & mic on mount
  const initLocalMedia = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.getTracks().some(t => t.readyState === 'live')) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 }
        }
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOff(false);
      return stream;
    } catch (err) {
      console.warn('Physical camera/mic access note:', err.name, err.message);
      // If camera is busy (e.g. 2 tabs on same machine), attempt audio or fallback canvas track
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const fallbackTrack = createFallbackVideoTrack('You');
        const hybridStream = new MediaStream([...audioStream.getAudioTracks(), fallbackTrack]);
        localStreamRef.current = hybridStream;
        setLocalStream(hybridStream);
        setIsVideoOff(false);
        setIsMirrored(false); // canvas fallback — don't mirror, text would appear backwards
        return hybridStream;
      } catch (err2) {
        console.warn('Microphone access note:', err2.name);
        const fallbackTrack = createFallbackVideoTrack('You');
        const simulatedStream = new MediaStream([fallbackTrack]);
        localStreamRef.current = simulatedStream;
        setLocalStream(simulatedStream);
        setIsVideoOff(false);
        setIsMirrored(false); // canvas fallback — don't mirror, text would appear backwards
        return simulatedStream;
      }
    }
  }, []);

  useEffect(() => {
    initLocalMedia();
  }, [initLocalMedia]);

  // Set up RTCPeerConnection ONCE per session match
  useEffect(() => {
    if (chatStatus !== 'matched' || !sessionId) {
      if (peerConnectionRef.current) {
        console.log('[WebRTC] Closing peer connection (call ended or not matched)');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(t => t.stop());
        remoteStreamRef.current = null;
      }
      setRemoteStream(null);
      setIsRemoteVideoLive(false);
      setConnectionState('new');
      pendingCandidatesRef.current = [];
      return;
    }

    console.log('[WebRTC] Establishing call session:', sessionId, 'role:', peerRole);
    let isMounted = true;

    // 1. One persistent remote MediaStream container for this call session
    const remoteMediaStream = new MediaStream();
    remoteStreamRef.current = remoteMediaStream;
    setRemoteStream(remoteMediaStream);
    setIsRemoteVideoLive(false);

    // 2. Synchronously create RTCPeerConnection with STUN servers
    const defaultServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];

    const pc = new RTCPeerConnection({ iceServers: defaultServers });
    peerConnectionRef.current = pc;
    pendingCandidatesRef.current = [];

    pc.onconnectionstatechange = () => {
      if (!isMounted) return;
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      if (!isMounted) return;
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionState('connected');
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setConnectionState('disconnected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsRef.current('ice_candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (!isMounted) return;
      console.log('[WebRTC] ontrack received:', event.track.kind, event.track.id);

      if (event.track) {
        if (!remoteMediaStream.getTracks().some(t => t.id === event.track.id)) {
          remoteMediaStream.addTrack(event.track);
        }

        const updateTrackLive = () => {
          if (!isMounted) return;
          const live = remoteMediaStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended');
          setIsRemoteVideoLive(live);
        };

        event.track.onmute = updateTrackLive;
        event.track.onunmute = updateTrackLive;
        event.track.onended = updateTrackLive;
        updateTrackLive();
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!remoteMediaStream.getTracks().some(t => t.id === track.id)) {
            remoteMediaStream.addTrack(track);
          }
        });
      }

      const hasVideo = remoteMediaStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended');
      setIsRemoteVideoLive(hasVideo);
    };

    // Add local tracks to RTCPeerConnection
    const attachLocalTracks = (stream) => {
      if (!stream || !pc || pc.signalingState === 'closed') return;
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some(s => s.track && s.track.id === track.id);
        if (!alreadyAdded) {
          pc.addTrack(track, stream);
        }
      });
    };

    // Ensure tracks attached before initiator creates offer
    const startPeerSession = async () => {
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await initLocalMedia();
      }
      if (!isMounted || peerConnectionRef.current !== pc) return;
      if (stream) {
        attachLocalTracks(stream);
      }

      if (peerRole === 'initiator') {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          if (!isMounted || peerConnectionRef.current !== pc) return;
          await pc.setLocalDescription(offer);
          sendWsRef.current('offer', {
            sessionId,
            sdp: offer
          });
          console.log('[WebRTC] Initiator sent offer');
        } catch (err) {
          console.error('[WebRTC] Failed to create offer:', err);
        }
      }
    };
    startPeerSession();

    // Signaling handlers using stable refs
    const unregisterOffer = registerSignalListenerRef.current('offer', async (data) => {
      const activePc = peerConnectionRef.current;
      if (!activePc || !data.payload?.sdp) return;
      console.log('[WebRTC] Receiver handling offer');

      try {
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await initLocalMedia();
        }
        if (stream && activePc.signalingState !== 'closed') {
          attachLocalTracks(stream);
        }

        await activePc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));

        while (pendingCandidatesRef.current.length > 0) {
          const candidate = pendingCandidatesRef.current.shift();
          try {
            await activePc.addIceCandidate(candidate);
          } catch (e) {
            console.warn('[WebRTC] Pending ICE candidate error:', e);
          }
        }

        const answer = await activePc.createAnswer();
        if (!isMounted || peerConnectionRef.current !== activePc) return;
        await activePc.setLocalDescription(answer);
        sendWsRef.current('answer', {
          sessionId,
          sdp: answer
        });
        console.log('[WebRTC] Receiver sent answer');
      } catch (err) {
        console.error('[WebRTC] Failed handling offer:', err);
      }
    });

    const unregisterAnswer = registerSignalListenerRef.current('answer', async (data) => {
      const activePc = peerConnectionRef.current;
      if (!activePc || !data.payload?.sdp) return;
      console.log('[WebRTC] Initiator handling answer');

      try {
        if (activePc.signalingState === 'have-local-offer') {
          await activePc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));

          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            try {
              await activePc.addIceCandidate(candidate);
            } catch (e) {
              console.warn('[WebRTC] Pending ICE candidate error:', e);
            }
          }
          console.log('[WebRTC] Call handshake complete');
        } else {
          console.warn('[WebRTC] Ignoring answer in state:', activePc.signalingState);
        }
      } catch (err) {
        console.error('[WebRTC] Failed setting remote answer:', err);
      }
    });

    const unregisterCandidate = registerSignalListenerRef.current('ice_candidate', async (data) => {
      const activePc = peerConnectionRef.current;
      const candidateData = data.payload?.candidate;
      if (!candidateData) return;

      try {
        const iceCandidate = new RTCIceCandidate(candidateData);
        if (activePc && activePc.remoteDescription && activePc.remoteDescription.type) {
          await activePc.addIceCandidate(iceCandidate);
        } else {
          pendingCandidatesRef.current.push(iceCandidate);
        }
      } catch (err) {
        console.error('[WebRTC] Error adding ICE candidate:', err);
      }
    });

    // Background fetch for TURN config if available
    api.getTurnCredentials(sessionId).then((turnConfig) => {
      if (turnConfig?.iceServers && isMounted && peerConnectionRef.current === pc) {
        try {
          pc.setConfiguration({ iceServers: turnConfig.iceServers });
        } catch {
          // Ignore if already connected
        }
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
      unregisterOffer();
      unregisterAnswer();
      unregisterCandidate();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(t => t.stop());
        remoteStreamRef.current = null;
      }
      pendingCandidatesRef.current = [];
    };
  }, [chatStatus, sessionId, peerRole]); // Rock-solid: Only restarts when matched call session changes!

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = async () => {
    if (!localStreamRef.current || localStreamRef.current.getVideoTracks().length === 0) {
      await initLocalMedia();
      return;
    }

    const tracks = localStreamRef.current.getVideoTracks();
    if (tracks.length > 0) {
      const nextEnabled = !tracks[0].enabled;
      tracks.forEach(track => {
        track.enabled = nextEnabled;
      });
      setIsVideoOff(!nextEnabled);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    }
  };

  const toggleMirror = () => {
    setIsMirrored(prev => !prev);
  };

  const toggleSwap = () => {
    setIsSwapped(prev => !prev);
  };

  return {
    localStream,
    remoteStream,
    isRemoteVideoLive,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    isSwapped,
    connectionState,
    toggleMute,
    toggleVideo,
    toggleMirror,
    toggleSwap,
    initLocalMedia
  };
}
