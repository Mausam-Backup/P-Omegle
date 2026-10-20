/**
 * Professional CLI / Container-Based Terminal Dashboard Logger
 * Modern left-spine cards inspired by Vite, Next.js, and Turbo CLI.
 * 100% immune to Windows/macOS/Linux font-width discrepancies.
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
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

const DIVIDER = '─'.repeat(46);

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Renders a clean left-spine card container
 */
function drawCard({ title, tag = '', color = ANSI.cyan, lines = [] }) {
  const time = timestamp();
  const badge = `${tag ? tag + ' ' : ''}${title}`;

  console.log(`\n${color}╭─ ${ANSI.bold}${badge}${ANSI.reset} ${color}${DIVIDER}${ANSI.dim} [${time}]${ANSI.reset}`);
  for (const line of lines) {
    console.log(`${color}│${ANSI.reset}   ${line}`);
  }
  console.log(`${color}╰${DIVIDER}──────${ANSI.reset}`);
}

export function shortId(id = '') {
  return id || 'unknown';
}

export const log = {
  wsConnect(userId, onlineCount, ip = 'unknown') {
    drawCard({
      title: 'CLIENT CONNECTED',
      tag: '🟢',
      color: ANSI.green,
      lines: [
        `${ANSI.dim}User ID  :${ANSI.reset} ${ANSI.bold}${userId}${ANSI.reset}`,
        `${ANSI.dim}Network  :${ANSI.reset} IP: ${ANSI.cyan}${ip}${ANSI.reset}  •  Active Pool: ${ANSI.bold}${onlineCount} online${ANSI.reset}`
      ]
    });
  },

  wsDisconnect(userId, onlineCount, reason = '') {
    const reasonText = reason ? `  •  Reason: ${reason}` : '';
    drawCard({
      title: 'CLIENT DISCONNECTED',
      tag: '🔴',
      color: ANSI.red,
      lines: [
        `${ANSI.dim}User ID  :${ANSI.reset} ${ANSI.bold}${userId}${ANSI.reset}`,
        `${ANSI.dim}Status   :${ANSI.reset} Disconnected${reasonText}  •  Remaining: ${ANSI.bold}${onlineCount} online${ANSI.reset}`
      ]
    });
  },

  queueJoin(userId, mode, interests = [], poolSize = 0) {
    const tagsStr = interests.length > 0 ? `[${interests.join(', ')}]` : 'any';
    drawCard({
      title: 'USER ENQUEUED',
      tag: '⏳',
      color: ANSI.yellow,
      lines: [
        `${ANSI.dim}User     :${ANSI.reset} ${ANSI.bold}${userId}${ANSI.reset}`,
        `${ANSI.dim}Criteria :${ANSI.reset} Mode: ${ANSI.cyan}${mode}${ANSI.reset}  •  Tags: ${ANSI.yellow}${tagsStr}${ANSI.reset}  •  Waiting Pool: ${ANSI.bold}${poolSize}${ANSI.reset}`
      ]
    });
  },

  queueLeave(userId) {
    const time = timestamp();
    console.log(`  ${ANSI.dim}[${time}]${ANSI.reset} ${ANSI.yellow}🚪 [QUEUE]${ANSI.reset} Dequeued user: ${userId}`);
  },

  match(peerA, peerB, sessionId, mode, tags = []) {
    const tagsStr = tags.length ? ` • Tags: [${tags.join(', ')}]` : '';
    drawCard({
      title: 'PAIR MATCHED',
      tag: '🎯',
      color: ANSI.cyan,
      lines: [
        `${ANSI.dim}Session  :${ANSI.reset} ${ANSI.bold}${sessionId}${ANSI.reset}`,
        `${ANSI.dim}User A   :${ANSI.reset} ${ANSI.green}${peerA}${ANSI.reset}`,
        `${ANSI.dim}User B   :${ANSI.reset} ${ANSI.blue}${peerB}${ANSI.reset}`,
        `${ANSI.dim}Mode     :${ANSI.reset} ${ANSI.yellow}${mode}${ANSI.reset}${tagsStr}`
      ]
    });
  },

  rtc(action, senderId, receiverId) {
    const time = timestamp();
    const actionFormatted = action.padEnd(8, ' ');
    console.log(
      `  ${ANSI.dim}[${time}]${ANSI.reset} ${ANSI.blue}📡 [RTC]${ANSI.reset} ${ANSI.bold}${actionFormatted}${ANSI.reset} │ ${senderId} ${ANSI.cyan}──▶${ANSI.reset} ${receiverId}`
    );
  },

  chat(userId, text = '') {
    const preview = text.length > 45 ? text.slice(0, 45) + '...' : text;
    drawCard({
      title: 'CHAT MESSAGE',
      tag: '💬',
      color: ANSI.magenta,
      lines: [
        `${ANSI.dim}Sender   :${ANSI.reset} ${ANSI.bold}${userId}${ANSI.reset}`,
        `${ANSI.dim}Message  :${ANSI.reset} "${preview}"`
      ]
    });
  },

  skip(userId, sessionId) {
    drawCard({
      title: 'USER SKIPPED',
      tag: '⏭️',
      color: ANSI.yellow,
      lines: [
        `${ANSI.dim}User     :${ANSI.reset} ${ANSI.bold}${userId}${ANSI.reset}`,
        `${ANSI.dim}Session  :${ANSI.reset} ${sessionId}`
      ]
    });
  },

  partnerLeft(sessionId, partnerId = '') {
    const partnerText = partnerId ? `  •  Partner: ${partnerId}` : '';
    drawCard({
      title: 'PARTNER LEFT CALL',
      tag: '⚠️',
      color: ANSI.gray,
      lines: [
        `${ANSI.dim}Session  :${ANSI.reset} ${sessionId}`,
        `${ANSI.dim}Notice   :${ANSI.reset} Call partner disconnected${partnerText}`
      ]
    });
  },

  http(method, path, status, duration) {
    // Silence routine background polling to keep Render CMD uncluttered
    if (path.startsWith('/api/stats/online') || path === '/health' || path.startsWith('/api/turn-credentials')) {
      if (status < 400) return;
    }

    const time = timestamp();
    const methodPad = method.padEnd(5, ' ');
    const statusColor = status >= 500 ? ANSI.red : status >= 400 ? ANSI.yellow : ANSI.green;
    console.log(
      `  ${ANSI.dim}[${time}]${ANSI.reset} ${statusColor}⚡ [HTTP] ${status}${ANSI.reset} │ ${methodPad} ${path} ${ANSI.dim}(${duration}ms)${ANSI.reset}`
    );
  }
};
