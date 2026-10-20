/**
 * Clean Terminal Logger for Render CMD & Local Development
 * Formats events into crystal-clear, descriptive lines visible in all console environments.
 */

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function shortId(id = '') {
  return id || 'unknown';
}

export const log = {
  wsConnect(userId, onlineCount, ip = 'unknown') {
    const time = `[${timestamp()}]`;
    console.log(`${time} [WS] 🟢 CLIENT CONNECTED: user=${userId} | IP=${ip} | (Total Online: ${onlineCount})`);
  },

  wsDisconnect(userId, onlineCount, reason = '') {
    const time = `[${timestamp()}]`;
    const reasonStr = reason ? ` | reason=${reason}` : '';
    console.log(`${time} [WS] 🔴 CLIENT DISCONNECTED: user=${userId}${reasonStr} | (Remaining Online: ${onlineCount})`);
  },

  queueJoin(userId, mode, interests = [], poolSize = 0) {
    const time = `[${timestamp()}]`;
    const tagsStr = interests.length > 0 ? `[${interests.join(', ')}]` : 'any';
    console.log(`${time} [QUEUE] ⏳ USER ENQUEUED: user=${userId} | mode=${mode} | interests=${tagsStr} | (Waiting Pool: ${poolSize})`);
  },

  queueLeave(userId) {
    const time = `[${timestamp()}]`;
    console.log(`${time} [QUEUE] 🚪 USER DEQUEUED: user=${userId}`);
  },

  match(peerA, peerB, sessionId, mode, tags = []) {
    const time = `[${timestamp()}]`;
    const tagsStr = tags.length ? ` | tags=[${tags.join(', ')}]` : '';
    console.log(`${time} [MATCH] 🎯 PAIR MATCHED! userA=${peerA} ⇄ userB=${peerB} | session=${sessionId} | mode=${mode}${tagsStr}`);
  },

  rtc(action, senderId, receiverId) {
    const time = `[${timestamp()}]`;
    console.log(`${time} [RTC] 📡 RELAY: action=${action} | from=${senderId} ➔ to=${receiverId}`);
  },

  chat(userId, text = '') {
    const time = `[${timestamp()}]`;
    const preview = text.length > 32 ? text.slice(0, 32) + '...' : text;
    console.log(`${time} [CHAT] 💬 user=${userId}: "${preview}"`);
  },

  skip(userId, sessionId) {
    const time = `[${timestamp()}]`;
    console.log(`${time} [SKIP] ⏭️ USER SKIPPED: user=${userId} | session=${sessionId}`);
  },

  partnerLeft(sessionId, partnerId = '') {
    const time = `[${timestamp()}]`;
    const partnerStr = partnerId ? ` | partner=${partnerId}` : '';
    console.log(`${time} [LEFT] ⚠️ PARTNER LEFT: session=${sessionId}${partnerStr}`);
  },

  http(method, path, status, duration) {
    // Silence routine background polling to keep Render CMD uncluttered
    if (path.startsWith('/api/stats/online') || path === '/health' || path.startsWith('/api/turn-credentials')) {
      if (status < 400) return;
    }

    const time = `[${timestamp()}]`;
    console.log(`${time} [HTTP] ⚡ ${method} ${path} -> ${status} (${duration}ms)`);
  }
};
