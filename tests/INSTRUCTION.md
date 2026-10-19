# 🧪 P-Omegle Multi-User Matchmaking & WebRTC Simulation Test

This test suite simulates multiple concurrent users connecting over WebSockets, entering the matchmaking queue (with interest tags and random fallback), pairing into 1-on-1 sessions, and completing full WebRTC signaling (Offer, Answer, ICE candidate exchange, and in-call messaging).

---

## 🚀 Quick Start

Ensure your backend server is running in another terminal (`npm run dev:server`), then run:

```bash
# Run the test with 20 simultaneous users (default)
node tests/multi_user_simulation.js
```

Or run via `npm`:

```bash
npm run test:simulation
```

---

## ⚙️ Customizing User Count

You can test with any number of simultaneous users (e.g. 10, 30, 50, 100):

```bash
# Test with 10 users (5 pairs)
node tests/multi_user_simulation.js 10

# Test with 40 users (20 pairs)
node tests/multi_user_simulation.js --users 40

# Test with 100 users (50 pairs)
node tests/multi_user_simulation.js --users 100
```

---

## 📊 What This Script Validates

| Step | Operation | Verification |
| :--- | :--- | :--- |
| **1. WebSocket Ingress** | Spawns `N` concurrent client connections to `ws://localhost:5000/ws`. | Verifies server accepts concurrent connections without socket drops. |
| **2. Matchmaking Queue** | Each user sends `join_queue` with alternating interest tags (`tech`, `gaming`, `music`, etc.). | Verifies atomic enqueue and no race conditions in the waiting pool. |
| **3. Session Pairing** | The matchmaking engine pairs users into isolated rooms (`sessionId`). | Verifies initiator / receiver role assignment and session isolation. |
| **4. SDP Offer Relay** | Initiator client generates and transmits an SDP offer. | Verifies gateway forwards the offer strictly to the matched partner. |
| **5. SDP Answer Relay** | Receiver client processes offer and transmits an SDP answer. | Verifies initiator receives the answer and signaling enters stable state. |
| **6. ICE Traversal** | Both peers exchange simulated ICE candidate packets. | Verifies low-latency candidate exchange without parsing errors. |
| **7. In-Call Messaging** | Both peers send real-time text chat messages over the session. | Verifies bidirectional message routing inside the active session. |
| **8. Clean Teardown** | All sockets disconnect cleanly. | Verifies memory cleanup and zero orphaned sessions. |

---

## 📈 Sample Output

```text
===============================================================
   🚀 P-OMEGLE WEBRTC & MATCHMAKING LOAD TEST (20 USERS)
   Connecting to: ws://localhost:5000/ws
===============================================================

Connecting 20 simultaneous users to the realtime gateway...
⏳ [1.1s] Connected: 20/20 | Matched: 20/20 | Handshakes: 10/10 pairs

===============================================================
             SIMULATION TEST REPORT & VERIFICATION             
===============================================================
 ⏱️  Total Test Execution Time   : 1.12s
 👥 Simultaneous Users Connected : 20 / 20 (100%)
 📥 Users Enqueued for Matching  : 20 / 20
 🤝 Users Successfully Paired    : 20 / 20 (10 isolated rooms)
 📤 WebRTC Offers Sent & Relayed : 10 sent, 10 received
 📥 WebRTC Answers Sent & Relayed: 10 sent, 10 received
 ❄️  ICE Candidates Exchanged     : 20
 💬 In-Call Messages Relayed     : 10
 🎯 Complete WebRTC Handshakes   : 10 / 10 pairs (100%)
 🛑 Signaling / Gateway Errors   : 0
===============================================================

🎉 SUCCESS: All 20 users (10 simultaneous pairs) were matched, exchanged full WebRTC signaling, and communicated without any packet drops!
```

---

## 🖥️ Testing with Real Browsers on the Same Machine

To test with actual camera and mic feeds between 2 browsers:

1. **Browser 1**: Open Chrome at `http://localhost:5173` and allow camera/microphone.
2. **Browser 2**: Open Microsoft Edge or Chrome Incognito at `http://localhost:5173`.
3. If the physical webcam is locked by Browser 1 on Windows, Browser 2 automatically switches to the **animated doodle canvas fallback** with synchronized audio.
4. Both peers will see and hear each other with live status controls.
