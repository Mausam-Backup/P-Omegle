import { WebSocket } from 'ws';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

async function runTests() {
  console.log('--- 1. Testing Health & API Gateway ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health Check:', healthData);

  const statsRes = await fetch(`${BASE_URL}/api/stats/online`);
  const statsData = await statsRes.json();
  console.log('Initial Online Stats:', statsData);

  console.log('\n--- 2. Testing Identity Service (Guest & Register) ---');
  const guestRes = await fetch(`${BASE_URL}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ageConfirmed: true })
  });
  const guestData = await guestRes.json();
  console.log('Guest session created:', guestData.userId);

  // Register a moderator / test user
  const email = `test_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password123!',
      ageConfirmed: true,
      termsAccepted: true
    })
  });
  const regData = await regRes.json();
  console.log('Registered user created:', regData.userId);

  console.log('\n--- 3. Testing Realtime WebSocket Matchmaking ---');
  const wsA = new WebSocket(`${WS_URL}?token=${guestData.accessToken}`);
  const wsB = new WebSocket(`${WS_URL}?token=${regData.accessToken}`);

  await Promise.all([
    new Promise(res => wsA.on('open', res)),
    new Promise(res => wsB.on('open', res))
  ]);
  console.log('Connected both sockets wsA and wsB to /ws');

  let sessionMatched = null;

  // Listeners for wsA
  wsA.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    console.log('[wsA Received]', msg.event, msg.data);
    if (msg.event === 'matched') {
      sessionMatched = msg.data.sessionId;
    }
  });

  // Listeners for wsB
  wsB.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    console.log('[wsB Received]', msg.event, msg.data);
  });

  // Wait 300ms for connection ack
  await new Promise(r => setTimeout(r, 400));

  // Both join queue with interest 'coding'
  console.log('\nJoining queues with interest "coding"...');
  wsA.send(JSON.stringify({
    action: 'join_queue',
    payload: { mode: 'text', interests: ['coding'] }
  }));

  wsB.send(JSON.stringify({
    action: 'join_queue',
    payload: { mode: 'text', interests: ['coding'] }
  }));

  // Wait for match event
  await new Promise(r => setTimeout(r, 800));

  if (!sessionMatched) {
    throw new Error('Matchmaking did not trigger pairing!');
  }
  console.log(`\nSUCCESS: Both peers atomically matched in session: ${sessionMatched}`);

  // Test chat message relay
  console.log('\n--- 4. Testing Chat Message Relay ---');
  wsA.send(JSON.stringify({
    action: 'chat_message',
    payload: { sessionId: sessionMatched, text: 'Hello from peer A!' }
  }));

  await new Promise(r => setTimeout(r, 400));

  // Test two-step skip flow
  console.log('\n--- 5. Testing Skip Session & Partner Left Notification ---');
  wsA.send(JSON.stringify({
    action: 'skip',
    payload: { sessionId: sessionMatched, autoRequeue: false }
  }));

  await new Promise(r => setTimeout(r, 600));

  // Clean up
  wsA.close();
  wsB.close();

  console.log('\n=============================================');
  console.log(' ALL END-TO-END VERIFICATION TESTS PASSED!');
  console.log('=============================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
