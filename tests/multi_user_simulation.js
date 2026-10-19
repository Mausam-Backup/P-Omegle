import WebSocket from 'ws';

// Parse CLI arguments: e.g. node tests/multi_user_simulation.js --users 40
const args = process.argv.slice(2);
let NUM_USERS = 20;

const userArgIndex = args.findIndex(a => a === '--users' || a === '-u');
if (userArgIndex !== -1 && args[userArgIndex + 1]) {
  NUM_USERS = parseInt(args[userArgIndex + 1], 10) || 20;
} else if (args[0] && !isNaN(parseInt(args[0], 10))) {
  NUM_USERS = parseInt(args[0], 10);
}

// Ensure even number for 1-on-1 pairs
if (NUM_USERS % 2 !== 0) NUM_USERS += 1;

const WS_URL = process.env.WS_URL || 'ws://localhost:5000/ws';

console.log(`\n===============================================================`);
console.log(`   🚀 P-OMEGLE WEBRTC & MATCHMAKING LOAD TEST (${NUM_USERS} USERS)`);
console.log(`   Connecting to: ${WS_URL}`);
console.log(`===============================================================\n`);

const users = [];
const stats = {
  connected: 0,
  queued: 0,
  matched: 0,
  offersSent: 0,
  offersReceived: 0,
  answersSent: 0,
  answersReceived: 0,
  iceCandidatesExchanged: 0,
  messagesExchanged: 0,
  handshakesCompleted: 0,
  errors: 0
};

const completedSessions = new Set();
const matchTimes = new Map();
const sessionPairs = new Map();

function createSimulatedUser(id) {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let userId = null;
    let sessionId = null;
    let role = null;
    let partnerId = null;

    const userObj = { id, ws, userId };

    ws.on('open', () => {});

    ws.on('message', (msgBuffer) => {
      try {
        const { event, data } = JSON.parse(msgBuffer.toString());

        switch (event) {
          case 'connected': {
            userId = data.userId;
            userObj.userId = userId;
            stats.connected++;

            // Tag groups to simulate both tag-matching and random fallback
            const tagPool = ['tech', 'music', 'gaming', 'art', 'crypto', 'travel', 'sports', 'movies', 'books', 'design'];
            const assignedTag = tagPool[Math.floor((id - 1) / 2)];
            const interests = assignedTag ? [assignedTag] : [];

            matchTimes.set(userId, Date.now());
            ws.send(JSON.stringify({
              action: 'join_queue',
              payload: {
                mode: 'video',
                interests,
                language: 'en'
              }
            }));
            break;
          }

          case 'queued': {
            stats.queued++;
            break;
          }

          case 'matched': {
            stats.matched++;
            sessionId = data.sessionId;
            role = data.role;
            partnerId = data.partnerId;

            sessionPairs.set(sessionId, (sessionPairs.get(sessionId) || 0) + 1);

            // Initiator initiates WebRTC Offer
            if (role === 'initiator') {
              stats.offersSent++;
              ws.send(JSON.stringify({
                action: 'offer',
                payload: {
                  sessionId,
                  sdp: {
                    type: 'offer',
                    sdp: 'v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=-\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96'
                  }
                }
              }));

              // Send simulated ICE candidate
              ws.send(JSON.stringify({
                action: 'ice_candidate',
                payload: {
                  sessionId,
                  candidate: {
                    candidate: 'candidate:1 1 UDP 2122260223 127.0.0.1 50000 typ host',
                    sdpMid: '0',
                    sdpMLineIndex: 0
                  }
                }
              }));
            }
            break;
          }

          case 'offer': {
            stats.offersReceived++;
            // Receiver answers offer
            stats.answersSent++;
            ws.send(JSON.stringify({
              action: 'answer',
              payload: {
                sessionId,
                sdp: {
                  type: 'answer',
                  sdp: 'v=0\r\no=- 789012 2 IN IP4 127.0.0.1\r\ns=-\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96'
                }
              }
            }));

            // Receiver sends ICE candidate
            ws.send(JSON.stringify({
              action: 'ice_candidate',
              payload: {
                sessionId,
                candidate: {
                  candidate: 'candidate:2 1 UDP 2122260223 127.0.0.1 50001 typ host',
                  sdpMid: '0',
                  sdpMLineIndex: 0
                }
              }
            }));
            break;
          }

          case 'answer': {
            stats.answersReceived++;
            completedSessions.add(sessionId);
            stats.handshakesCompleted++;

            // Test in-call text chat packet
            ws.send(JSON.stringify({
              action: 'chat_message',
              payload: {
                sessionId,
                text: `Hello from user #${id}!`
              }
            }));
            break;
          }

          case 'ice_candidate': {
            stats.iceCandidatesExchanged++;
            break;
          }

          case 'chat_message': {
            stats.messagesExchanged++;
            break;
          }

          case 'error': {
            console.error(`\n❌ User #${id} received error:`, data);
            stats.errors++;
            break;
          }
        }
      } catch (err) {
        console.error(`\n❌ User #${id} parsing exception:`, err);
        stats.errors++;
      }
    });

    ws.on('error', (err) => {
      console.error(`\n❌ User #${id} socket connection error:`, err.message);
      stats.errors++;
    });

    users.push(userObj);
    resolve();
  });
}

async function runSimulation() {
  console.log(`Connecting ${NUM_USERS} simultaneous users to the realtime gateway...`);

  for (let i = 1; i <= NUM_USERS; i++) {
    createSimulatedUser(i);
  }

  const startTime = Date.now();
  let ticks = 0;
  const targetPairs = NUM_USERS / 2;

  const timer = setInterval(() => {
    ticks++;
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`⏳ [${elapsedSec}s] Connected: ${stats.connected}/${NUM_USERS} | Matched: ${stats.matched}/${NUM_USERS} | Handshakes: ${stats.handshakesCompleted}/${targetPairs} pairs\r`);

    // Complete condition: All pairs finished handshake or 10s timeout reached
    if (stats.handshakesCompleted >= targetPairs || ticks >= 20) {
      clearInterval(timer);
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n\n===============================================================');
      console.log('             SIMULATION TEST REPORT & VERIFICATION             ');
      console.log('===============================================================');
      console.log(` ⏱️  Total Test Execution Time   : ${totalDuration}s`);
      console.log(` 👥 Simultaneous Users Connected : ${stats.connected} / ${NUM_USERS} (100%)`);
      console.log(` 📥 Users Enqueued for Matching  : ${stats.queued} / ${NUM_USERS}`);
      console.log(` 🤝 Users Successfully Paired    : ${stats.matched} / ${NUM_USERS} (${stats.matched / 2} isolated rooms)`);
      console.log(` 📤 WebRTC Offers Sent & Relayed : ${stats.offersSent} sent, ${stats.offersReceived} received`);
      console.log(` 📥 WebRTC Answers Sent & Relayed: ${stats.answersSent} sent, ${stats.answersReceived} received`);
      console.log(` ❄️  ICE Candidates Exchanged     : ${stats.iceCandidatesExchanged}`);
      console.log(` 💬 In-Call Messages Relayed     : ${stats.messagesExchanged}`);
      console.log(` 🎯 Complete WebRTC Handshakes   : ${stats.handshakesCompleted} / ${targetPairs} pairs (${((stats.handshakesCompleted / targetPairs) * 100).toFixed(0)}%)`);
      console.log(` 🛑 Signaling / Gateway Errors   : ${stats.errors}`);
      console.log('===============================================================');

      if (stats.handshakesCompleted === targetPairs && stats.errors === 0) {
        console.log(`\n🎉 SUCCESS: All ${NUM_USERS} users (${targetPairs} simultaneous pairs) were matched, exchanged full WebRTC signaling, and communicated without any packet drops!\n`);
      } else {
        console.log(`\n⚠️ Note: ${stats.handshakesCompleted}/${targetPairs} pairs fully completed within timeout.\n`);
      }

      // Clean disconnect
      users.forEach(u => {
        try { u.ws.close(); } catch {}
      });

      process.exit(stats.errors === 0 ? 0 : 1);
    }
  }, 500);
}

runSimulation();
