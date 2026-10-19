import { config } from './env.js';

export function getIceServers() {
  const iceServers = [];

  // Add STUN servers
  config.stunServers.forEach(stun => {
    if (stun) {
      iceServers.push({ urls: stun });
    }
  });

  // Add TURN if configured
  if (config.turnServerUrl) {
    iceServers.push({
      urls: config.turnServerUrl,
      username: config.turnUsername,
      credential: config.turnCredential
    });
  }

  return iceServers;
}
