import { config } from './env.js';

export function getIceServers() {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ];

  // If custom TURN server is provided in environment variables, add it
  if (config.turnServerUrl) {
    const urls = config.turnServerUrl.includes(',')
      ? config.turnServerUrl.split(',').map(u => u.trim())
      : config.turnServerUrl;

    iceServers.push({
      urls,
      username: config.turnUsername || undefined,
      credential: config.turnCredential || undefined
    });
  }

  return iceServers;
}
