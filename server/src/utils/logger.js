/**
 * Clean Terminal Logger
 * Formats events into compact, column-aligned single-line status logs.
 * Filters out high-frequency polling noise like /api/stats/online and /health.
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
  if (!id) return '';
  if (id.startsWith('guest_')) return '#' + id.slice(6, 12);
  if (id.startsWith('usr_')) return '@' + id.slice(4, 10);
  if (id.startsWith('sess_')) return 'sess#' + id.slice(5, 11);
  return id.length > 8 ? id.slice(0, 8) : id;
}

export const log = {
  wsConnect(userId, onlineCount) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.cyan}${ANSI.bold}[WS]    ${ANSI.reset}`;
    console.log(`${time} ${tag} 🟢 Connect    ${ANSI.bold}${shortId(userId).padEnd(9)}${ANSI.reset} ${ANSI.dim}(${onlineCount} online)${ANSI.reset}`);
  },

  wsDisconnect(userId, onlineCount) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.cyan}${ANSI.bold}[WS]    ${ANSI.reset}`;
    console.log(`${time} ${tag} 🔴 Disconn    ${ANSI.bold}${shortId(userId).padEnd(9)}${ANSI.reset} ${ANSI.dim}(${onlineCount} online)${ANSI.reset}`);
  },

  queueJoin(userId, mode, interests = [], poolSize = 0) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.yellow}${ANSI.bold}[QUEUE] ${ANSI.reset}`;
    const tagsStr = interests.length > 0 ? `[${interests.join(', ')}]` : 'any';
    console.log(`${time} ${tag} ⏳ Enqueue    ${ANSI.bold}${shortId(userId).padEnd(9)}${ANSI.reset} ${mode} ${ANSI.dim}(tags: ${tagsStr} | pool: ${poolSize})${ANSI.reset}`);
  },

  queueLeave(userId) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.yellow}${ANSI.bold}[QUEUE] ${ANSI.reset}`;
    console.log(`${time} ${tag} 🚪 Dequeue    ${shortId(userId)}`);
  },

  match(peerA, peerB, sessionId, mode, tags = []) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.magenta}${ANSI.bold}[MATCH] ${ANSI.reset}`;
    const tagsStr = tags.length ? ` ${ANSI.dim}(#${tags.join(', #')})${ANSI.reset}` : '';
    console.log(`${time} ${tag} 🎯 Paired     ${ANSI.bold}${shortId(peerA)}${ANSI.reset} ⇄ ${ANSI.bold}${shortId(peerB)}${ANSI.reset}  ${ANSI.dim}${shortId(sessionId)}${ANSI.reset}${tagsStr}`);
  },

  rtc(action, senderId, receiverId) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.blue}${ANSI.bold}[RTC]   ${ANSI.reset}`;
    const symbol = action === 'offer' ? '📡 Offer' : action === 'answer' ? '🤝 Answer' : '⚡ Media';
    console.log(`${time} ${tag} ${symbol.padEnd(9)}  ${shortId(senderId)} ➔ ${shortId(receiverId)}`);
  },

  chat(userId, text = '') {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.green}${ANSI.bold}[CHAT]  ${ANSI.reset}`;
    const preview = text.length > 32 ? text.slice(0, 32) + '...' : text;
    console.log(`${time} ${tag} 💬 ${shortId(userId)}: "${preview}"`);
  },

  skip(userId, sessionId) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.yellow}${ANSI.bold}[SKIP]  ${ANSI.reset}`;
    console.log(`${time} ${tag} ⏭️  Skipped    ${shortId(userId)}  ${ANSI.dim}(${shortId(sessionId)})${ANSI.reset}`);
  },

  partnerLeft(sessionId) {
    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.red}${ANSI.bold}[LEFT]  ${ANSI.reset}`;
    console.log(`${time} ${tag} ⚠️ Stranger left  ${ANSI.dim}(${shortId(sessionId)})${ANSI.reset}`);
  },

  http(method, path, status, duration) {
    // Silence routine background polling to keep the terminal uncluttered
    if (path.startsWith('/api/stats/online') || path === '/health' || path.startsWith('/api/turn-credentials')) {
      if (status < 400) return; // Only log if there's an error on polling endpoints
    }

    const time = `${ANSI.gray}[${timestamp()}]${ANSI.reset}`;
    const tag = `${ANSI.gray}[HTTP]  ${ANSI.reset}`;
    const color = status >= 500 ? ANSI.red : status >= 400 ? ANSI.yellow : ANSI.green;
    console.log(`${time} ${tag} ⚡ ${method.padEnd(5)} ${path.padEnd(22)} ${color}${status}${ANSI.reset} ${ANSI.dim}(${duration}ms)${ANSI.reset}`);
  }
};
