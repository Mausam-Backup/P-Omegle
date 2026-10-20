import { config } from './env.js';

export function getIceServers() {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' }
  ];

  // If custom TURN server is provided in environment variables, prioritize it
  if (config.turnServerUrl) {
    iceServers.push({
      urls: config.turnServerUrl,
      username: config.turnUsername,
      credential: config.turnCredential
    });
  } else {
    // Default to Open Relay Project free TURN relay (UDP, TCP & TLS over ports 80 & 443)
    // Ensures WebRTC connects across different Wi-Fi networks, mobile carriers (4G/5G), and Symmetric NAT/CGNAT
    iceServers.push({
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:80?transport=tcp',
        'turn:openrelay.metered.ca:443',
        'turns:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    });
  }

  return iceServers;
}
