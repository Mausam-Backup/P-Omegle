import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
    .split(',')
    .map(o => o.trim()),

  // Auth & Security
  jwtSecret: process.env.JWT_SECRET || 'omegle_super_secret_jwt_key_2026_dev_mode',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'omegle_refresh_secret_key_2026',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // Matchmaking & Session Settings
  interestTimeoutMs: parseInt(process.env.MATCHMAKING_INTEREST_TIMEOUT_MS || '5000', 10),
  cooldownMs: parseInt(process.env.MATCHMAKING_COOLDOWN_MS || '15000', 10),
  sessionGracePeriodMs: parseInt(process.env.SESSION_GRACE_PERIOD_MS || '15000', 10),
  heartbeatIntervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '10000', 10),

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '120', 10),

  // WebRTC ICE / STUN / TURN
  stunServers: (process.env.STUN_SERVERS || 'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302')
    .split(',')
    .map(s => s.trim()),
  turnServerUrl: process.env.TURN_SERVER_URL || '',
  turnUsername: process.env.TURN_SERVER_USERNAME || '',
  turnCredential: process.env.TURN_SERVER_CREDENTIAL || '',
};
