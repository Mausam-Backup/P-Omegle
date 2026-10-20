import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();

  // Navigation flow: 'lobby' | 'call'
  const [currentView, setCurrentView] = useState('lobby'); // Default to lobby/setup screen
  const [mode, setMode] = useState('video');
  const [interests, setInterests] = useState(['design', 'tech']);

  // Chat status: 'idle' | 'searching' | 'matched' | 'ended'
  const [chatStatus, setChatStatus] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [peerRole, setPeerRole] = useState(null);
  const [sharedInterests, setSharedInterests] = useState([]);
  const [partnerId, setPartnerId] = useState(null);
  const [iceServers, setIceServers] = useState(null);

  // Partner display details (Anonymous Stranger)
  const [partner, setPartner] = useState({
    name: 'Stranger',
    avatar: 'stranger',
    location: 'Global'
  });

  // Call duration in seconds (formatted as "0:00")
  const [callDuration, setCallDuration] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // Chat drawer visibility
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Messages
  const [messages, setMessages] = useState([]);

  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [stats, setStats] = useState({ onlineUsers: 1, waitingInQueue: 0 });

  const signalListenersRef = useRef(new Map());
  const signalQueueRef = useRef([]); // Buffers early WebRTC signals until listener registers
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ── Stale-closure fix ──────────────────────────────────────────────────────
  // Keep a ref that always points to the LATEST handleSocketEvent.
  // The ws.onmessage callback (created once) reads through the ref so it never
  // captures stale state.
  const handleSocketEventRef = useRef(null);

  // Call duration counter
  useEffect(() => {
    let interval = null;
    if (chatStatus === 'matched' && isLive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [chatStatus, isLive]);

  // Search duration counter (seconds spent searching)
  const [searchDuration, setSearchDuration] = useState(0);
  useEffect(() => {
    let interval = null;
    if (chatStatus === 'searching') {
      interval = setInterval(() => {
        setSearchDuration(prev => prev + 1);
      }, 1000);
    } else {
      setSearchDuration(0);
    }
    return () => clearInterval(interval);
  }, [chatStatus]);

  // Partner left info (when stranger disconnects)
  const [partnerLeftInfo, setPartnerLeftInfo] = useState(null);

  // Partner media state (when stranger mutes audio or disables video)
  const [partnerMediaState, setPartnerMediaState] = useState({
    isAudioMuted: false,
    isVideoOff: false
  });

  // Format MM:SS (e.g. 1:23)
  const formatLiveDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Poll online stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getOnlineStats();
        if (data && typeof data.onlineUsers === 'number') {
          setStats(prev => ({
            ...prev,
            onlineUsers: Math.max(1, data.onlineUsers),
            waitingInQueue: data.waitingInQueue || 0,
            activeSessions: data.activeSessions || 0
          }));
        }
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const chatStatusRef = useRef(chatStatus);
  chatStatusRef.current = chatStatus;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const interestsRef = useRef(interests);
  interestsRef.current = interests;

  // Connect WebSocket (stable instance, never churns on state updates)
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;

    try {
      const token = sessionStorage.getItem('omegle_guest_token') || localStorage.getItem('omegle_access_token');
      const defaultWsUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? (window.location.hostname.includes('vercel.app')
            ? 'wss://omegle-backend-r1e4.onrender.com/ws'
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`)
        : 'ws://localhost:5000/ws';
      const wsUrl = `${import.meta.env.VITE_WS_URL || defaultWsUrl}${token ? `?token=${token}` : ''}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to Live Video Gateway');
        // If client was searching when socket disconnected, immediately re-enqueue
        if (chatStatusRef.current === 'searching') {
          ws.send(JSON.stringify({
            action: 'join_queue',
            payload: {
              mode: modeRef.current,
              interests: interestsRef.current,
              language: navigator.language || 'en'
            }
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const { event: evtName, data } = JSON.parse(event.data);
          handleSocketEventRef.current?.(evtName, data);
        } catch (err) {
          console.error('[WS] Error parsing message', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Socket disconnected, scheduling reconnect...');
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2500);
      };

      ws.onerror = (err) => {
        console.error('[WS] Socket error', err);
      };
    } catch (err) {
      console.warn('[WS] Connect error:', err);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  // Keep-alive heartbeat every 15s to prevent Render/Cloudflare from dropping idle WebSockets
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'heartbeat',
          payload: { sessionId }
        }));
      }
    }, 15000);

    return () => clearInterval(heartbeatTimer);
  }, [sessionId]);

  const handleSocketEvent = (event, data) => {
    switch (event) {
      case 'presence_stats': {
        if (data && typeof data.onlineUsers === 'number') {
          setStats(prev => ({
            ...prev,
            onlineUsers: Math.max(1, data.onlineUsers),
            waitingInQueue: data.waitingInQueue || 0,
            activeSessions: data.activeSessions || 0
          }));
        }
        break;
      }

      case 'queued':
        setChatStatus('searching');
        break;

      case 'matched': {
        sounds.playMatchChime();
        // ── Transition to call view ──────────────────────────────────────────
        // Preserve any early signals arriving for THIS new session, discard older ones
        signalQueueRef.current = signalQueueRef.current.filter(
          item => (item.data?.sessionId || item.data?.payload?.sessionId) === data.sessionId
        );
        setCurrentView('call');
        setChatStatus('matched');
        setIsLive(true);
        setCallDuration(0);
        setSearchDuration(0);
        setPartnerLeftInfo(null);
        setPartnerMediaState({ isAudioMuted: false, isVideoOff: false });
        setSessionId(data.sessionId);
        setPeerRole(data.role);
        setSharedInterests(data.sharedInterests || []);
        setPartnerId(data.partnerId);
        if (data.iceServers && Array.isArray(data.iceServers) && data.iceServers.length > 0) {
          setIceServers(data.iceServers);
        }

        setPartner({
          name: 'Stranger',
          avatar: 'stranger',
          location: 'Global'
        });
        break;
      }

      case 'session_restored': {
        // Reconnected to a session within the grace period
        setCurrentView('call');
        setChatStatus('matched');
        setIsLive(true);
        setSessionId(data.sessionId);
        setPartnerId(data.partnerId);
        break;
      }

      case 'session_ended':
        // Server confirmed our own skip/end
        break;

      case 'partner_left': {
        sounds.playDisconnectSound();
        setPartnerLeftInfo({
          duration: callDuration,
          reason: data?.reason || 'Stranger has left the conversation.'
        });
        setChatStatus('partner_left');
        setIsLive(false);
        setSessionId(null);
        setPeerRole(null);
        setPartnerId(null);
        setPartnerMediaState({ isAudioMuted: false, isVideoOff: false });
        break;
      }

      case 'media_state': {
        if (data?.payload) {
          setPartnerMediaState(prev => ({
            ...prev,
            ...data.payload
          }));
        }
        break;
      }

      case 'chat_message': {
        sounds.playMessagePop();
        setIsStrangerTyping(false);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setMessages(prev => [
          ...prev,
          {
            id: 'msg_' + Date.now(),
            sender: 'stranger',
            text: data.payload?.text || '',
            time: timeStr,
            author: partner.name
          }
        ]);
        break;
      }

      case 'typing_start':
        setIsStrangerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsStrangerTyping(false), 4000);
        break;

      case 'typing_stop':
        setIsStrangerTyping(false);
        break;

      case 'offer':
      case 'answer':
      case 'ice_candidate': {
        const handler = signalListenersRef.current.get(event);
        if (handler) {
          handler(data);
        } else {
          console.log(`[WS] Buffering signal '${event}' for session ${data?.sessionId || data?.payload?.sessionId}`);
          signalQueueRef.current.push({ event, data, timestamp: Date.now() });
        }
        break;
      }

      default:
        break;
    }
  };

  // ── Always keep the ref pointing at the latest render's handler ──────────
  // This must run on every render, before any WebSocket message can arrive.
  handleSocketEventRef.current = handleSocketEvent;

  const sendWs = useCallback((action, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, payload }));
    }
  }, []);

  const registerSignalListener = useCallback((signalType, callback) => {
    signalListenersRef.current.set(signalType, callback);

    // Flush any pending early signals of this type
    const remaining = [];
    signalQueueRef.current.forEach((item) => {
      if (item.event === signalType) {
        try {
          console.log(`[WS] Dispatching buffered signal '${signalType}'`);
          callback(item.data);
        } catch (err) {
          console.error(`[WS] Error in buffered signal handler '${signalType}':`, err);
        }
      } else {
        remaining.push(item);
      }
    });
    signalQueueRef.current = remaining;

    return () => {
      signalListenersRef.current.delete(signalType);
    };
  }, []);

  // Switch User (FR-OME-07 / Skip Action)
  const switchUser = useCallback(() => {
    sounds.playDisconnectSound();
    if (sessionId) {
      sendWs('skip', {
        sessionId,
        autoRequeue: true,
        mode: 'video',
        interests,
        language: navigator.language || 'en'
      });
    } else {
      sendWs('join_queue', {
        mode: 'video',
        interests,
        language: navigator.language || 'en'
      });
    }

    setSessionId(null);
    setPeerRole(null);
    setPartnerId(null);
    setChatStatus('searching');
    setCallDuration(0);
    setMessages([]);
  }, [sessionId, interests, sendWs]);

  // End Call & Return to Lobby
  const endCall = useCallback(() => {
    if (sessionId) {
      sendWs('skip', {
        sessionId,
        autoRequeue: false,
        mode: 'video'
      });
    }
    setSessionId(null);
    setPeerRole(null);
    setPartnerId(null);
    setIsLive(false);
    setChatStatus('idle');
    setCallDuration(0);
    setMessages([]);
    setCurrentView('lobby');
  }, [sessionId, sendWs]);

  // Start Call from Lobby
  const startCall = useCallback(() => {
    setCurrentView('call');
    setChatStatus('searching');
    setCallDuration(0);
    setSearchDuration(0);
    setPartnerLeftInfo(null);
    setPartnerMediaState({ isAudioMuted: false, isVideoOff: false });
    setSessionId(null);
    setPeerRole(null);
    setPartnerId(null);
    setMessages([]);
    setIsLive(true);
    sendWs('join_queue', {
      mode: 'video',
      interests,
      language: navigator.language || 'en'
    });
  }, [interests, sendWs]);

  // Find Next Stranger (from Partner Left or Skip)
  const findNextStranger = useCallback(() => {
    setPartnerLeftInfo(null);
    setChatStatus('searching');
    setCallDuration(0);
    setSearchDuration(0);
    setSessionId(null);
    setPeerRole(null);
    setPartnerId(null);
    setMessages([]);
    setIsLive(true);
    setPartnerMediaState({ isAudioMuted: false, isVideoOff: false });
    sendWs('join_queue', {
      mode: 'video',
      interests,
      language: navigator.language || 'en'
    });
  }, [interests, sendWs]);

  // Clear Interests and Instant Fallback Match
  const clearInterestsAndSearch = useCallback(() => {
    setInterests([]);
    setSearchDuration(0);
    setChatStatus('searching');
    sendWs('join_queue', {
      mode: 'video',
      interests: [],
      language: navigator.language || 'en'
    });
  }, [sendWs]);

  // Send in-call text chat message
  const sendMessage = (text) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    if (sessionId) {
      sendWs('chat_message', {
        sessionId,
        text: cleanText
      });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages(prev => [
      ...prev,
      {
        id: 'msg_you_' + Date.now(),
        sender: 'you',
        text: cleanText,
        time: timeStr
      }
    ]);
  };

  const sendTypingStatus = (isTyping) => {
    if (!sessionId) return;
    sendWs(isTyping ? 'typing_start' : 'typing_stop', { sessionId });
  };

  return (
    <ChatContext.Provider
      value={{
        currentView,
        setCurrentView,
        mode,
        setMode,
        interests,
        setInterests,
        chatStatus,
        sessionId,
        peerRole,
        sharedInterests,
        partnerId,
        partner,
        callDuration,
        formatLiveDuration,
        searchDuration,
        partnerLeftInfo,
        partnerMediaState,
        findNextStranger,
        clearInterestsAndSearch,
        isLive,
        isChatOpen,
        setIsChatOpen,
        messages,
        isStrangerTyping,
        stats,
        switchUser,
        endCall,
        startCall,
        sendMessage,
        sendTypingStatus,
        sendWs,
        registerSignalListener,
        iceServers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
