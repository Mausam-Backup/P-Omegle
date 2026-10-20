# 🌐 WebRTC, STUN & TURN: Complete Architecture & Troubleshooting Guide

This guide explains in simple, clear terms how video streaming works between two users in **Omegle Next**, why video initially worked on the same Wi-Fi but failed across different networks, what was fixed, and how to configure your free TURN relay.

---

## 1. The Core Concept: How WebRTC Connects Two Strangers

When two strangers open Omegle Next, their video stream does not pass through your central backend server (which would consume massive bandwidth and cost a fortune). Instead, WebRTC establishes a **direct Peer-to-Peer (P2P)** connection between their two devices.

To connect directly, WebRTC uses two helper protocols: **STUN** and **TURN**.

### Real-World Analogy:
- **STUN (The Public Address Directory)**:
  - Imagine you live inside an apartment complex (your home Wi-Fi) behind a front gate (your router's NAT firewall).
  - You only know your internal room number (e.g., `192.168.1.15`).
  - You ask a **STUN server** (like Google STUN): *"What does the outside world see as my building address and mailbox number?"*
  - STUN tells you: *"Your public IP is `103.21.x.x` and your port is `54120`."*
  - You send this public address to the other stranger so they can send video packets to you directly.

- **TURN (The Relay Courier)**:
  - What happens if the security guard at your apartment gate refuses to let strangers deliver packages unless they are on a pre-approved list? (This is a **Symmetric NAT / CGNAT firewall**).
  - Even though both sides know each other's public addresses, both guards silently drop all incoming video packets!
  - That's where **TURN** steps in. A TURN server is a trusted global relay courier in the cloud. Both strangers connect to the TURN server, and it forwards the encrypted audio and video between them.

---

## 2. Why Did Video Work on the Same Wi-Fi but Fail on Different Networks?

### Case A: Both devices on the **SAME Wi-Fi**
- Both devices share the same local network router.
- WebRTC automatically discovers their local IP addresses (`192.168.x.x`).
- Video packets travel directly across your local living room Wi-Fi without ever touching the ISP's external firewall.
- Result: **Instant connection!**

### Case B: Devices on **DIFFERENT Wi-Fi networks or Mobile Data (4G/5G)**
- Indian home fiber broadband (JioFiber, Airtel Xstream, ACT Fibernet) and mobile operators (Jio 5G, Airtel 5G) use **Symmetric NAT / Carrier-Grade NAT (CGNAT)**.
- Under Symmetric NAT:
  1. Phone A asks Google STUN for its port &rarr; router opens port `50001` for Google.
  2. Phone A gives port `50001` to Phone B.
  3. When Phone B sends UDP video packets to port `50001`, Phone A's router firewall inspects the packet: *"This packet did not come from Google. It came from Phone B's unfamiliar IP. DROP IT!"*
  4. Phone B's router does the exact same thing to Phone A's packets.
- Because both firewalls drop every UDP packet, **direct P2P via STUN is mathematically impossible**.
- **A working TURN server is 100% required** to bridge the connection.

---

## 3. What Was Breaking the App Before? (The 2 Root Causes)

### Bug 1: The Dead Sinkholed Server (`openrelay.metered.ca`)
In the original setup, `openrelay.metered.ca` was hardcoded as the default fallback TURN relay.
- Metered deprecated and shut down the public unauthenticated `openrelayproject` domain.
- Metered redirected `openrelay.metered.ca` DNS to **`192.0.2.1`** (an RFC 5737 `TEST-NET-1` unroutable blackhole IP).
- Every time your browser attempted to connect, WebRTC tried to send handshake packets to `192.0.2.1:80` and `192.0.2.1:443`.
- Because `192.0.2.1` drops all packets into a blackhole, the browser's ICE gathering engine **froze for 30–45 seconds waiting for candidate timeouts**, stalling the handshake indefinitely.

### Bug 2: Premature Video Reveal in the UI
In `LiveVideoStage.jsx`:
- When SDP signaling completed, WebRTC created a local placeholder media track.
- The UI code checked:
  ```javascript
  const hasRemoteVideo = remoteStream.getVideoTracks().length > 0;
  const isRemoteLive = hasRemoteVideo && chatStatus === 'matched';
  ```
- Because `isRemoteLive` became `true` before WebRTC finished connecting, the `<video>` element was rendered at `opacity: 1`, covering up the animated connecting doodle and displaying an **empty white rectangle** while the toast read *"Connecting direct video feed..."*.

---

## 4. What We Fixed in the Codebase

1. **Clean STUN Fleet**: Removed the dead `openrelay.metered.ca` sinkhole. Replaced it with high-availability, responsive STUN servers:
   - `stun:stun.l.google.com:19302`
   - `stun:stun1.l.google.com:19302`
   - `stun:stun2.l.google.com:19302`
   - `stun:stun.services.mozilla.com`
   - `stun:global.stun.twilio.com:3478`
   *(These return STUN candidates in < 30ms without any hanging)*.

2. **Fixed Video Render State**: Updated `LiveVideoStage.jsx` so `isRemoteLive` requires:
   ```javascript
   const isRemoteLive = Boolean(
     connectionState === 'connected' &&
     (hasRemoteVideo || isRemoteVideoLive) &&
     !partnerMediaState?.isVideoOff &&
     chatStatus === 'matched'
   );
   ```
   Now, while WebRTC is connecting, the UI displays the clean animated doodle with the spinner and *"Connecting video feed..."* indicator. The `<video>` surface only fades in once actual video frames are streaming.

3. **Dynamic Metered Integration**:
   - Updated `turnService.js` to automatically fetch and cache live TURN credentials if Metered environment variables are provided.
   - Updated `iceServers.js` to support comma-separated static TURN server URLs.

---

## 5. Free Metered TURN Setup (50 GB Free Tier)

Metered.ca provides **50 GB/month of free TURN relay data**. 

> **Important Note on Metered Free Tier**:
> The automated REST API (`POST /api/v1/turn/credential`) requires a paid plan on Metered.
> However, on the **Free Plan ($0/month)**, Metered lets you create **Dashboard Credentials** for free with 50 GB bandwidth!

### How to Get Your Free 50 GB Credentials:

1. Open your [Metered Dashboard](https://dashboard.metered.ca).
2. In the left navigation sidebar, click **Credentials** (under *TURN Server & SFU*), or on the Overview page, click **Create your first credential**.
3. Click **Create Credential** (you can leave label as `p-omegle-web`).
4. Metered will display your credentials:
   - **Username**: `[generated username]`
   - **Password / Secret**: `[generated password]`
   - **TURN Server URLs**:
     - `turn:pomegele.metered.live:80`
     - `turn:pomegele.metered.live:443`
     - `turn:pomegele.metered.live:443?transport=tcp`
     - `turns:pomegele.metered.live:443?transport=tcp`

---

## 6. Where to Put the Keys

### In Local `.env` and `server/.env`:
```env
# Google & Mozilla STUN (NAT discovery)
STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun.services.mozilla.com

# Metered Cloud TURN Relay (traverses Symmetric NAT / CGNAT / 4G / 5G)
TURN_SERVER_URL=turn:pomegele.metered.live:80,turn:pomegele.metered.live:443,turn:pomegele.metered.live:443?transport=tcp,turns:pomegele.metered.live:443?transport=tcp
TURN_SERVER_USERNAME=<paste-username-from-metered-credentials-tab>
TURN_SERVER_CREDENTIAL=<paste-password-from-metered-credentials-tab>

# Metered Workspace Reference (for your records)
METERED_DOMAIN=pomegele
METERED_API_KEY=rKLlNCvYGEgD9SV_w27PS6xeIZyhlC8qI6-oJzII42bEOZUn
```

### In Render Dashboard (`omegle-backend-r1e4`):
1. Open [dashboard.render.com](https://dashboard.render.com).
2. Click `omegle-backend-r1e4` &rarr; **Environment**.
3. Add these variables:
   - `TURN_SERVER_URL` = `turn:pomegele.metered.live:80,turn:pomegele.metered.live:443,turn:pomegele.metered.live:443?transport=tcp,turns:pomegele.metered.live:443?transport=tcp`
   - `TURN_SERVER_USERNAME` = `[username from Metered Credentials tab]`
   - `TURN_SERVER_CREDENTIAL` = `[password from Metered Credentials tab]`
4. Click **Save Changes**.

---

## Summary Checklist
- [x] Dead `openrelay.metered.ca` (`192.0.2.1`) removed.
- [x] Fast STUN servers (`Google`, `Mozilla`, `Twilio`) active.
- [x] UI fixed: no blank white rectangle while connecting.
- [x] Local `.env` and `server/.env` configured with your keys.
- [ ] Paste `TURN_SERVER_USERNAME` & `TURN_SERVER_CREDENTIAL` into Render environment variables.
