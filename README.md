# Omegle Next: Modern Random Video & Text Chat Platform

A modern, fast, secure, and privacy-conscious Omegle-style video and text chat platform engineered according to the [Product Requirements Document (PRD)](file:///e:/P-Omegle/Random%20Video%20Chat%20Platform%20%E2%80%93%20Project%20Requirements%20Document.md).

Built with a discrete microservice-oriented backend architecture (REST API Gateway, Realtime WebSocket Gateway, Atomic Matchmaking Engine, WebRTC Signaling Relay, Session Lifecycle Manager, Safety & Moderation Services) and a sleek React + Vite frontend featuring glassmorphism, responsive dual-video grids, interest matching, typing indicators, and instant skip controls.

---

## 🚀 Key Features (Omegle Feature Parity & Safety Upgrades)

- **Video & Text Chat Modes (FR-OME-01, FR-OME-02):** Select between live two-way WebRTC audio/video with side text, or pure anonymous text messaging.
- **Interest-Based Matching with 5s Fallback (FR-MATCH-08, FR-OME-03):** Tag input with popular suggestions; pairs partners who share passions, falling back automatically to pure random matching after 5 seconds.
- **Anonymous Partner Identity (FR-OME-04):** Partners appear only as `"Stranger"` and `"You"`.
- **Classic System Status Lines (FR-OME-05):** Status cues: `"Looking for someone..."`, `"You're now chatting with a random stranger..."`, and `"Stranger has disconnected."`.
- **Live Typing Indicator (FR-OME-06):** Displays `"Stranger is typing..."` in real time with debounce and auto-timeout.
- **Two-Step Esc / Skip Button (FR-OME-07):** Press Esc or click Skip once to reveal `"Really?"`, and press again to confirm and start a new search instantly.
- **Fast Skip & Race-Free Matching (FR-SESS-01, FR-SESS-02):** Invalidates old session server-side before re-entering pool; stale messages are rejected.
- **15-Second Reconnect Grace Period (FR-SESS-04):** Temporary network drops hold the session for 15 seconds to allow reconnect without abruptly dropping the call.
- **Comprehensive Video Controls (FR-OME-11):** Mute microphone, disable camera, mirror self-view, swap local & stranger frames, and toggle fullscreen.
- **Chat Transcript Export (FR-OME-10):** Download chat logs locally as `.txt` files; no message content is permanently stored on the server.
- **Safety, Reporting & Blocking (FR-SAFE-01, FR-SAFE-02):** Report partners with categorized reasons and optional comments; mutual block prevents rematches.
- **Moderator Dashboard (FR-SAFE-04):** Real-time report queue with rolling evidence snapshots (recent text messages & timing) and 1-click ban/suspend capabilities.
- **18+ Age Verification & Mandatory Auth / Guest Mode (FR-AUTH-04, FR-OME-14):** Age verification checkbox and guest session generation out of the box.

---

## 📁 Project Architecture & Folder Structure

```
e:\P-Omegle\
├── .env                                  # Root environment variables
├── .env.example                          # Root environment template
├── docker-compose.yml                    # Multi-container orchestration (Server, Client, Redis, Postgres)
├── package.json                          # Workspace orchestration scripts
│
├── contracts/                            # Architecture contracts & interfaces (PRD Section 6.8 & 7.3)
│   ├── events.json                       # Event catalogue specifications
│   └── proto/                            # Protobuf definitions for microservices
│       ├── identity.proto
│       ├── matchmaking.proto
│       ├── session.proto
│       └── signaling.proto
│
├── server/                               # Discrete Modular Microservices Backend
│   ├── .env                              # Server environment
│   ├── .env.example
│   ├── package.json
│   ├── test-e2e.js                       # End-to-end integration & concurrency test suite
│   └── src/
│       ├── config/                       # Environment loader & ICE servers
│       ├── gateway/
│       │   ├── apiGateway.js             # REST API routing & rate-limiting
│       │   └── realtimeGateway.js        # WebSocket manager & event dispatcher
│       ├── services/                     # Domain microservices
│       │   ├── identity/                 # Auth, bcrypt hashing, tokens, 18+ check
│       │   ├── matchmaking/              # Atomic pairing, interest matching & fallback
│       │   ├── session/                  # State machine, skip logic, grace periods
│       │   ├── signaling/                # WebRTC SDP/ICE relay & chat messages
│       │   ├── safety/                   # Reports, blocks & evidence buffer
│       │   ├── moderation/               # Mod review queue & sanctions
│       │   ├── presence/                 # Online user counts & heartbeats
│       │   └── turn/                     # Ephemeral TURN credential provider
│       ├── store/                        # Storage layer (Redis schema & Memory adapter)
│       └── server.js                     # Unified server bootstrap
│
└── client/                               # Modern React + Vite SPA Frontend
    ├── .env                              # Client environment
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html                        # Google fonts (Outfit/Inter) & SEO metadata
    └── src/
        ├── styles/
        │   └── index.css                 # Glassmorphism design system & responsive layout
        ├── context/
        │   ├── AuthContext.jsx           # Token management, guest start & modals
        │   └── ChatContext.jsx           # WebSocket communication & room state machine
        ├── hooks/
        │   └── useWebRTC.js              # RTCPeerConnection, streams & media controls
        ├── components/
        │   ├── layout/                   # Header, SafetyBanner
        │   ├── home/                     # LandingHero with mode cards & interest tags
        │   ├── video/                    # VideoStage with dual feed & floating toolbar
        │   ├── chat/                     # ChatBox, ActionControls (two-step Skip)
        │   ├── moderation/               # ReportModal, ModeratorDashboard
        │   └── auth/                     # AuthModal (18+ verification)
        ├── services/
        │   ├── api.js                    # REST client
        │   └── soundEffects.js           # Web Audio procedural chimes
        ├── App.jsx
        └── main.jsx
```

---

## 🛠️ Environment Variables Configuration (`.env`)

Every environment variable required by the system is templated in `.env.example` and configured in `.env`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP & WebSocket port | `5000` |
| `CLIENT_ORIGIN` | Allowed client URL for CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for access tokens | `dev_secret_key` |
| `MATCHMAKING_INTEREST_TIMEOUT_MS` | Delay before falling back from interest matching to random | `5000` (5s) |
| `MATCHMAKING_COOLDOWN_MS` | Cool-down period before rematches | `15000` (15s) |
| `SESSION_GRACE_PERIOD_MS` | Disconnect grace period | `15000` (15s) |
| `STUN_SERVERS` | Google / STUN server list | `stun:stun.l.google.com:19302` |
| `VITE_SERVER_URL` | Client endpoint for REST API | `http://localhost:5000` |
| `VITE_WS_URL` | Client endpoint for WebSocket | `ws://localhost:5000/ws` |

---

## 🏃 Running the Application Locally

### 1. Start the Backend Server:
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5000` with WebSocket at `ws://localhost:5000/ws`.

### 2. Start the Frontend Client:
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Run the Automated End-to-End Test Suite:
```bash
cd server
node test-e2e.js
```
Runs full dual-client matchmaking, interest matching, signaling, chat message relay, and skip invalidation.
