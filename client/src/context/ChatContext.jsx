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
  const [stats, setStats] = useState({ onlineUsers: 1420, waitingInQueue: 12 });

  const signalListenersRef = useRef(new Map());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

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

  // Format MM:SS (e.g. 1:23)
  const formatLiveDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Poll online stats
  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getOnlineStats();
      if (data?.onlineUsers) {
        setStats(prev => ({
          ...prev,
          onlineUsers: Math.max(data.onlineUsers, 1280),
          waitingInQueue: data.waitingInQueue || 8
        }));
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const token = sessionStorage.getItem('omegle_guest_token') || localStorage.getItem('omegle_access_token');
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws'}${token ? `?token=${token}` : ''}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to Live Video Gateway');
    };

    ws.onmessage = (event) => {
      try {
        const { event: evtName, data } = JSON.parse(event.data);
        handleSocketEvent(evtName, data);
      } catch (err) {
        console.error('[WS] Error parsing message', err);
      }
    };

    ws.onclose = () => {
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Socket error', err);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  const handleSocketEvent = (event, data) => {
    switch (event) {
      case 'queued':
        setChatStatus('searching');
        break;

      case 'matched': {
        sounds.playMatchChime();
        setChatStatus('matched');
        setIsLive(true);
        setCallDuration(0);
        setSessionId(data.sessionId);
        setPeerRole(data.role);
        setSharedInterests(data.sharedInterests || []);
        setPartnerId(data.partnerId);

        setPartner({
          name: 'Stranger',
          avatar: 'stranger',
          location: 'Global'
        });
        break;
      }

      case 'partner_left': {
        sounds.playDisconnectSound();
        setSessionId(null);
        setPeerRole(null);
        setPartnerId(null);
        setCallDuration(0);
        setMessages([]);
        setChatStatus('searching');
        sendWs('join_queue', {
          mode: 'video',
          interests,
          language: navigator.language || 'en'
        });
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
        }
        break;
      }

      default:
        break;
    }
  };

  const sendWs = useCallback((action, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, payload }));
    }
  }, []);

  const registerSignalListener = useCallback((signalType, callback) => {
    signalListenersRef.current.set(signalType, callback);
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
        registerSignalListener
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
