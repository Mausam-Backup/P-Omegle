import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import { verifyAccessToken } from '../services/identity/tokenUtils.js';
import { matchmakingEngine } from '../services/matchmaking/matchmakingEngine.js';
import { sessionManager } from '../services/session/sessionManager.js';
import { signalingRelay } from '../services/signaling/signalingRelay.js';
import { presenceTracker } from '../services/presence/presenceTracker.js';
import { turnService } from '../services/turn/turnService.js';
import { log } from '../utils/logger.js';

class RealtimeGateway {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> { socket, userId, socketId, user }
    this.socketToUser = new Map(); // socket -> userId
  }

  initialize(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Check matchmaking engine matches periodically to broadcast to connected sockets
    setInterval(() => {
      this.broadcastMatches();
    }, 200);

    // Broadcast live presence count to all clients periodically
    setInterval(() => {
      this.broadcastPresence();
    }, 3000);

    // Keep-alive ping frames every 25 seconds to prevent Render / Cloudflare proxy drop
    setInterval(() => {
      for (const client of this.clients.values()) {
        if (client.socket && client.socket.readyState === WebSocket.OPEN) {
          try {
            client.socket.ping();
          } catch {}
        }
      }
    }, 25000);

    console.log('[RealtimeGateway] WebSocket server initialized on /ws (Keep-Alive ping active)');
  }

  broadcastPresence() {
    if (!this.clients || this.clients.size === 0) return;
    const stats = {
      onlineUsers: this.clients.size,
      waitingInQueue: matchmakingEngine.getQueueSize(),
      activeSessions: Math.floor(sessionManager.sessions ? sessionManager.sessions.size : 0)
    };
    const payload = JSON.stringify({ event: 'presence_stats', data: stats });
    for (const client of this.clients.values()) {
      if (client.socket && client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(payload);
        } catch {}
      }
    }
  }

  handleConnection(ws, req) {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const token = parsedUrl.searchParams.get('token');

    let user = null;
    if (token) {
      user = verifyAccessToken(token);
    }

    // If no token or invalid, generate anonymous guest ID
    const userId = user?.userId || 'guest_' + Math.random().toString(36).substring(2, 10);
    const socketId = 'sock_' + Math.random().toString(36).substring(2, 10);

    const clientRecord = {
      socket: ws,
      userId,
      socketId,
      user: user || { userId, isGuest: true },
      ip: req.socket.remoteAddress
    };

    this.clients.set(userId, clientRecord);
    this.socketToUser.set(ws, userId);

    // Track presence
    presenceTracker.registerPresence(userId, socketId, req.socket.remoteAddress);

    // Check if this user had a disconnected session in grace period
    const restoredSession = sessionManager.handleReconnect(userId, socketId);
    if (restoredSession && restoredSession.restored) {
      const partnerClient = this.clients.get(restoredSession.partnerId);
      if (partnerClient && partnerClient.socket.readyState === WebSocket.OPEN) {
        this.send(partnerClient.socket, 'partner_reconnected', {
          sessionId: restoredSession.sessionId
        });
      }
      this.send(ws, 'session_restored', {
        sessionId: restoredSession.sessionId,
        partnerId: restoredSession.partnerId
      });
    }

    // Send initial connection acknowledgement
    this.send(ws, 'connected', {
      userId,
      socketId,
      isGuest: !user
    });

    log.wsConnect(userId, this.clients.size, clientRecord.ip);
    this.broadcastPresence();

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(clientRecord, message);
      } catch (err) {
        console.error('[RealtimeGateway] Message error:', err);
        this.send(ws, 'error', { message: 'Malformed JSON payload' });
      }
    });

    // Handle close
    ws.on('close', () => {
      this.handleDisconnect(clientRecord);
    });

    ws.on('error', (err) => {
      console.error('[RealtimeGateway] Socket error:', err.message);
    });
  }

  handleMessage(client, msg) {
    const { action, payload = {} } = msg;
    const { userId, socket } = client;

    switch (action) {
      // 1. Matchmaking
      case 'join_queue': {
        const { mode = 'video', interests = [], language = 'en' } = payload;
        try {
          matchmakingEngine.joinQueue({
            userId,
            socketId: client.socketId,
            mode,
            interests,
            language
          });

          this.send(socket, 'queued', {
            mode,
            interests,
            estimatedWaitMs: 1500
          });

          log.queueJoin(userId, mode, interests, matchmakingEngine.getQueueSize());

          // Trigger immediate evaluation
          this.broadcastMatches();
        } catch (err) {
          console.error(`[QUEUE] ❌ Queue error for ${userId}:`, err.message);
          this.send(socket, 'error', { message: err.message });
        }
        break;
      }

      case 'leave_queue': {
        matchmakingEngine.leaveQueue(userId);
        this.send(socket, 'queue_left', {});
        log.queueLeave(userId);
        break;
      }

      // 2. Skip Session (FR-SESS-01, FR-SESS-02)
      case 'skip': {
        const { sessionId, autoRequeue = true, mode = 'video', interests = [], language = 'en' } = payload;
        const result = sessionManager.skipSession(sessionId, userId);
        log.skip(userId, sessionId);

        // Notify partner immediately if online
        if (result.partnerId) {
          const partnerClient = this.clients.get(result.partnerId);
          if (partnerClient && partnerClient.socket.readyState === WebSocket.OPEN) {
            this.send(partnerClient.socket, 'partner_left', {
              sessionId,
              reason: 'Stranger has disconnected.'
            });
          }
        }

        this.send(socket, 'session_ended', { sessionId, skipped: true });

        // Optimistic / Instant Requeue if requested
        if (autoRequeue) {
          matchmakingEngine.joinQueue({
            userId,
            socketId: client.socketId,
            mode,
            interests,
            language
          });
          this.send(socket, 'queued', { mode, interests });
          this.broadcastMatches();
        }
        break;
      }

      // 3. WebRTC Signaling Relay (offer, answer, candidate, media_state)
      case 'offer':
      case 'answer':
      case 'ice_candidate':
      case 'media_state': {
        const { sessionId } = payload;
        const relayResult = signalingRelay.processSignal({
          sessionId,
          senderId: userId,
          type: action,
          payload
        });

        if (relayResult.allowed && relayResult.partnerId) {
          const partnerClient = this.clients.get(relayResult.partnerId);
          if (partnerClient && partnerClient.socket.readyState === WebSocket.OPEN) {
            this.send(partnerClient.socket, action, relayResult.forwardEnvelope);
            if (action !== 'ice_candidate') {
              log.rtc(action, userId, relayResult.partnerId);
            }
          }
        }
        break;
      }

      // 4. In-session Chat & Typing Indicators (FR-RTC-05, FR-OME-06)
      case 'chat_message':
      case 'typing_start':
      case 'typing_stop': {
        const { sessionId } = payload;
        const relayResult = signalingRelay.processSignal({
          sessionId,
          senderId: userId,
          type: action,
          payload
        });

        if (relayResult.allowed && relayResult.partnerId) {
          const partnerClient = this.clients.get(relayResult.partnerId);
          if (partnerClient && partnerClient.socket.readyState === WebSocket.OPEN) {
            this.send(partnerClient.socket, action, relayResult.forwardEnvelope);
            if (action === 'chat_message') {
              log.chat(userId, payload?.text);
            }
          }
        }
        break;
      }

      // 5. Heartbeat (FR-SESS-06)
      case 'heartbeat': {
        const { sessionId } = payload;
        presenceTracker.registerPresence(userId, client.socketId, client.ip);
        if (sessionId) {
          sessionManager.heartbeat(sessionId, userId);
        }
        this.send(socket, 'heartbeat_ack', { timestamp: Date.now() });
        break;
      }

      default:
        console.warn(`[RealtimeGateway] Unknown action: ${action}`);
    }
  }

  async broadcastMatches() {
    const matches = matchmakingEngine.processPool();
    if (!matches || matches.length === 0) return;

    for (const match of matches) {
      const { sessionId, mode, sharedInterests, peerA, peerB } = match;

      // Register session in session manager
      sessionManager.createSession({
        sessionId,
        peerA,
        peerB,
        mode,
        sharedInterests
      });

      log.match(peerA.userId, peerB.userId, sessionId, mode, sharedInterests);

      const clientA = this.clients.get(peerA.userId);
      const clientB = this.clients.get(peerB.userId);

      // Fetch active ICE & TURN relay servers
      let iceServers = [];
      try {
        const creds = await turnService.getIceCredentials(peerA.userId, sessionId);
        iceServers = creds?.iceServers || [];
      } catch (err) {
        console.warn('[RealtimeGateway] Could not fetch iceCredentials for match:', err.message);
      }

      if (clientA && clientA.socket.readyState === WebSocket.OPEN) {
        this.send(clientA.socket, 'matched', {
          sessionId,
          role: 'initiator',
          mode,
          sharedInterests,
          partnerId: peerB.userId,
          iceServers
        });
      }

      if (clientB && clientB.socket.readyState === WebSocket.OPEN) {
        this.send(clientB.socket, 'matched', {
          sessionId,
          role: 'receiver',
          mode,
          sharedInterests,
          partnerId: peerA.userId,
          iceServers
        });
      }
    }
  }

  handleDisconnect(client) {
    const { userId, socket } = client;
    this.clients.delete(userId);
    this.socketToUser.delete(socket);
    presenceTracker.unregisterPresence(userId);
    matchmakingEngine.leaveQueue(userId);

    log.wsDisconnect(userId, this.clients.size);
    this.broadcastPresence();

    // Grace period handling
    sessionManager.handleDisconnect(userId, (sessionId, partnerId) => {
      // Grace period expired without reconnect
      if (partnerId) {
        const partnerClient = this.clients.get(partnerId);
        if (partnerClient && partnerClient.socket.readyState === WebSocket.OPEN) {
          this.send(partnerClient.socket, 'partner_left', {
            sessionId,
            reason: 'Stranger has disconnected (connection lost).'
          });
        }
      }
    });
  }

  send(socket, event, data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    }
  }
}

export const realtimeGateway = new RealtimeGateway();
