const API_BASE = import.meta.env.VITE_SERVER_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? (window.location.hostname.includes('vercel.app') ? 'https://omegle-backend-r1e4.onrender.com' : window.location.origin)
    : 'http://localhost:5000'
);

function getHeaders() {
  const token = sessionStorage.getItem('omegle_guest_token') || localStorage.getItem('omegle_access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Identity & Auth
  async register(data) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async startGuestSession() {
    const res = await fetch(`${API_BASE}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ageConfirmed: true })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to start guest session');
    return json;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: getHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async getOnlineStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats/online`);
      if (!res.ok) return { onlineUsers: 1, waitingInQueue: 0, activeSessions: 0 };
      return await res.json();
    } catch {
      return { onlineUsers: 1, waitingInQueue: 0, activeSessions: 0 };
    }
  },

  async getTurnCredentials(sessionId) {
    try {
      const res = await fetch(`${API_BASE}/api/turn-credentials?sessionId=${sessionId || ''}`, {
        headers: getHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Safety & Reporting
  async submitReport({ reportedId, sessionId, reason, comment }) {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reportedId, sessionId, reason, comment })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to file report');
    return json;
  },

  async blockUser(targetUserId) {
    const res = await fetch(`${API_BASE}/api/blocks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId })
    });
    return await res.json();
  },

  // Moderation
  async getModerationReports() {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch moderation queue');
    return await res.json();
  },

  async takeModerationAction(userId, action, reason, reportId) {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, reason, reportId })
    });
    if (!res.ok) throw new Error('Action failed');
    return await res.json();
  }
};
