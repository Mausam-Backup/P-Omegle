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
  let frameCount = 0;

  const draw = () => {
    frameCount++;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing animated circle
    angle = (angle + 0.06) % (Math.PI * 2);
    const pulse = Math.sin(angle) * 10;

    // Outer glow
    const grad = ctx.createRadialGradient(320, 200, 20, 320, 200, 90 + pulse);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#4338ca');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(320, 200, 75 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Doodle Face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(320, 180, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(320, 250, 48, Math.PI, 0, true);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(310, 178, 4, 0, Math.PI * 2);
    ctx.arc(330, 178, 4, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 188, 8, 0, Math.PI, false);
    ctx.stroke();

    // Label & Feed Status
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 320, 335);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Live Simulated Camera', 320, 365);
  };

  draw();
  const interval = setInterval(draw, 50); // 20 fps
  const stream = canvas.captureStream(20);
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

/**
 * Creates a silent audio track using Web Audio API so WebRTC
 * peer connections always have an audio track even when physical mic is busy.
 */
function createSilentAudioTrack() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    const gain = ctx.createGain();
    gain.gain.value = 0; // completely silent
    osc.connect(gain);
    gain.connect(dst);
    osc.start();
    return dst.stream.getAudioTracks()[0] || null;
  } catch (err) {
    console.warn('[WebRTC] Silent audio track creation note:', err);
    return null;
  }
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
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) | 'environment' (back)
  const facingModeRef = useRef('user');

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localMediaPromiseRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const sendWsRef = useRef(sendWs);
  sendWsRef.current = sendWs;

  const registerSignalListenerRef = useRef(registerSignalListener);
  registerSignalListenerRef.current = registerSignalListener;

  // Auto-acquire camera & mic (default to front camera on mobile)
  const initLocalMedia = useCallback(async (desiredFacing = 'user') => {
    if (localStreamRef.current && localStreamRef.current.getTracks().some(t => t.readyState === 'live')) {
      return localStreamRef.current;
    }
    if (localMediaPromiseRef.current) {
      return localMediaPromiseRef.current;
    }

    localMediaPromiseRef.current = (async () => {
      try {
        const gdmPromise = navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: desiredFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 30 }
          }
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Physical camera busy or timed out')), 2500)
        );

        const stream = await Promise.race([gdmPromise, timeoutPromise]);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoOff(false);
        setIsMirrored(desiredFacing === 'user');
        setFacingMode(desiredFacing);
        facingModeRef.current = desiredFacing;
        console.log(`[WebRTC] Physical camera (${desiredFacing}) and mic acquired successfully`);
        return stream;
      } catch (err) {
        console.warn('[WebRTC] Physical camera access note:', err.name, err.message);

        // Fallback: try physical audio with 1.5s timeout, plus canvas video
        let audioTrack = null;
        try {
          const audioPromise = navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Audio timeout')), 1500)
          );
          const audioStream = await Promise.race([audioPromise, audioTimeout]);
          audioTrack = audioStream.getAudioTracks()[0] || null;
        } catch {
          audioTrack = createSilentAudioTrack();
        }

        const fallbackVideoTrack = createFallbackVideoTrack('You');
        const tracks = [fallbackVideoTrack];
        if (audioTrack) tracks.push(audioTrack);

        const fallbackStream = new MediaStream(tracks);
        localStreamRef.current = fallbackStream;
        setLocalStream(fallbackStream);
        setIsVideoOff(false);
        setIsMirrored(false); // canvas fallback — don't mirror, text would appear backwards
        console.log('[WebRTC] Using simulated fallback camera stream');
        return fallbackStream;
      } finally {
        localMediaPromiseRef.current = null;
      }
    })();

    return localMediaPromiseRef.current;
  }, []);

  useEffect(() => {
    initLocalMedia();
  }, [initLocalMedia]);

  // Ensure local tracks are attached whenever localStream is acquired or updated
  useEffect(() => {
    if (localStream && peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
      const pc = peerConnectionRef.current;
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some(s => s.track && s.track.id === track.id);
        if (!alreadyAdded) {
          try {
            pc.addTrack(track, localStream);
          } catch (e) {
            console.warn('[WebRTC] Track attach error:', e.message);
          }
        }
      });
    }
  }, [localStream]);

  // Set up RTCPeerConnection ONCE per session match
  useEffect(() => {
    if (chatStatus !== 'matched' || !sessionId) {
      if (peerConnectionRef.current) {
        console.log('[WebRTC] Closing peer connection (call ended or not matched)');
        try {
          peerConnectionRef.current.close();
        } catch {}
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

    // 2. STUN configuration
    const defaultServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];

    const pc = new RTCPeerConnection({ iceServers: defaultServers });
    peerConnectionRef.current = pc;
    pendingCandidatesRef.current = [];

    // Helper to safely attach local tracks to RTCPeerConnection
    const attachLocalTracks = (stream) => {
      if (!stream || !pc || pc.signalingState === 'closed') return;
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some(s => s.track && s.track.id === track.id);
        if (!alreadyAdded) {
          try {
            pc.addTrack(track, stream);
            console.log('[WebRTC] Attached local track to PC:', track.kind, track.id);
          } catch (e) {
            console.warn('[WebRTC] attachLocalTracks note:', e.message);
          }
        }
      });
    };

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
        if (remoteMediaStream.getVideoTracks().length > 0) {
          setIsRemoteVideoLive(true);
        }
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setConnectionState('disconnected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        sendWsRef.current('ice_candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (!isMounted) return;
      console.log('[WebRTC] 🎥 ontrack received:', event.track.kind, event.track.id);

      if (event.track) {
        if (!remoteMediaStream.getTracks().some(t => t.id === event.track.id)) {
          remoteMediaStream.addTrack(event.track);
        }

        const updateTrackLive = () => {
          if (!isMounted) return;
          const live = remoteMediaStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended');
          console.log('[WebRTC] Remote track state changed, isLive:', live);
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

      // Re-instantiate MediaStream container so React & <video> element detect updates
      const updatedStream = new MediaStream(remoteMediaStream.getTracks());
      remoteStreamRef.current = updatedStream;
      setRemoteStream(updatedStream);

      const hasVideo = updatedStream.getVideoTracks().some(t => t.enabled && t.readyState !== 'ended');
      setIsRemoteVideoLive(hasVideo);
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
          console.log('[WebRTC] Initiator creating offer for session:', sessionId);
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
          console.log('[WebRTC] Initiator sent offer successfully');
        } catch (err) {
          console.error('[WebRTC] Failed to create/send offer:', err);
        }
      }
    };
    startPeerSession();

    // Receiver: Handle Offer
    const unregisterOffer = registerSignalListenerRef.current('offer', async (data) => {
      const activePc = peerConnectionRef.current;
      const sdpData = data.payload?.sdp || data.sdp;
      if (!activePc || !sdpData) return;
      console.log('[WebRTC] Receiver processing incoming offer');

      try {
        // Guarantee local tracks are ready before creating answer
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await initLocalMedia();
        }
        if (!isMounted || peerConnectionRef.current !== activePc || activePc.signalingState === 'closed') return;
        if (stream) {
          attachLocalTracks(stream);
        }

        if (activePc.signalingState !== 'stable') {
          console.warn('[WebRTC] Ignoring offer in unexpected signalingState:', activePc.signalingState);
          return;
        }

        await activePc.setRemoteDescription(new RTCSessionDescription(sdpData));
        console.log('[WebRTC] Receiver set remote description (offer)');

        // Drain pending candidates
        while (pendingCandidatesRef.current.length > 0) {
          const candidate = pendingCandidatesRef.current.shift();
          try {
            await activePc.addIceCandidate(candidate);
          } catch (e) {
            console.warn('[WebRTC] Pending ICE candidate error:', e);
          }
        }

        const answer = await activePc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        if (!isMounted || peerConnectionRef.current !== activePc) return;
        await activePc.setLocalDescription(answer);

        sendWsRef.current('answer', {
          sessionId,
          sdp: answer
        });
        console.log('[WebRTC] Receiver created and sent answer successfully');
      } catch (err) {
        console.error('[WebRTC] Failed handling offer:', err);
      }
    });

    // Initiator: Handle Answer
    const unregisterAnswer = registerSignalListenerRef.current('answer', async (data) => {
      const activePc = peerConnectionRef.current;
      const sdpData = data.payload?.sdp || data.sdp;
      if (!activePc || !sdpData) return;
      console.log('[WebRTC] Initiator handling answer');

      try {
        if (activePc.signalingState === 'have-local-offer') {
          await activePc.setRemoteDescription(new RTCSessionDescription(sdpData));
          console.log('[WebRTC] Initiator set remote description (answer) -> Stable');

          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            try {
              await activePc.addIceCandidate(candidate);
            } catch (e) {
              console.warn('[WebRTC] Pending ICE candidate error:', e);
            }
          }
          console.log('[WebRTC] WebRTC handshake complete');
        } else {
          console.warn('[WebRTC] Ignoring answer in unexpected state:', activePc.signalingState);
        }
      } catch (err) {
        console.error('[WebRTC] Failed setting remote answer:', err);
      }
    });

    // Handle ICE Candidates
    const unregisterCandidate = registerSignalListenerRef.current('ice_candidate', async (data) => {
      const activePc = peerConnectionRef.current;
      const candidateData = data.payload?.candidate || data.candidate;
      if (!candidateData || !candidateData.candidate) return;

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

    // Background fetch for TURN config if configured on backend
    api.getTurnCredentials(sessionId).then((turnConfig) => {
      const hasTurn = turnConfig?.iceServers?.some(s => {
        const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
        return urls.some(u => typeof u === 'string' && u.startsWith('turn:'));
      });
      if (hasTurn && isMounted && peerConnectionRef.current === pc && pc.signalingState !== 'closed') {
        try {
          pc.setConfiguration({ iceServers: turnConfig.iceServers });
          console.log('[WebRTC] TURN configuration applied');
        } catch {}
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
      unregisterOffer();
      unregisterAnswer();
      unregisterCandidate();
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
        peerConnectionRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(t => t.stop());
        remoteStreamRef.current = null;
      }
      pendingCandidatesRef.current = [];
    };
  }, [chatStatus, sessionId, peerRole]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        const newMuted = !track.enabled;
        setIsAudioMuted(newMuted);
        if (sessionId) {
          sendWsRef.current('media_state', {
            sessionId,
            isAudioMuted: newMuted,
            isVideoOff
          });
        }
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
      const newOff = !nextEnabled;
      setIsVideoOff(newOff);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      if (sessionId) {
        sendWsRef.current('media_state', {
          sessionId,
          isAudioMuted,
          isVideoOff: newOff
        });
      }
    }
  };

  const toggleMirror = () => {
    setIsMirrored(prev => !prev);
  };

  const toggleSwap = () => {
    setIsSwapped(prev => !prev);
  };

  const switchCamera = useCallback(async () => {
    try {
      const nextMode = facingModeRef.current === 'user' ? 'environment' : 'user';
      console.log(`[WebRTC] Flipping camera to: ${nextMode}`);

      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: nextMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (e) {
        // Fallback without exact constraint if device doesn't support 'exact'
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: nextMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) return;

      if (localStreamRef.current) {
        const oldTracks = localStreamRef.current.getVideoTracks();
        oldTracks.forEach(t => t.stop());

        const currentAudio = localStreamRef.current.getAudioTracks();
        const updatedStream = new MediaStream([...currentAudio, newVideoTrack]);
        localStreamRef.current = updatedStream;
        setLocalStream(updatedStream);
      }

      // Front camera mirrored, rear camera unmirrored
      setIsMirrored(nextMode === 'user');
      setFacingMode(nextMode);
      facingModeRef.current = nextMode;

      // Replace track on live RTCPeerConnection sender
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
          console.log('[WebRTC] RTCPeerConnection video sender track replaced successfully');
        }
      }
    } catch (err) {
      console.warn('[WebRTC] Switch camera error:', err.name, err.message);
    }
  }, []);

  return {
    localStream,
    remoteStream,
    isRemoteVideoLive,
    isAudioMuted,
    isVideoOff,
    isMirrored,
    isSwapped,
    facingMode,
    switchCamera,
    connectionState,
    toggleMute,
    toggleVideo,
    toggleMirror,
    toggleSwap,
    initLocalMedia
  };
}

