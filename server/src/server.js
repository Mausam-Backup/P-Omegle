import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { apiRouter } from './gateway/apiGateway.js';
import { realtimeGateway } from './gateway/realtimeGateway.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { log } from './utils/logger.js';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or dev)
    if (!origin || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev permissive
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

// Clean HTTP Request Logger (silences routine polling clutter)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log.http(req.method, req.originalUrl, res.statusCode, Date.now() - start);
  });
  next();
});

// Friendly root endpoint for browser inspection
app.get('/', (req, res) => {
  res.json({
    name: 'Omegle Next Realtime API & Matchmaking Gateway',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      websocket: '/ws'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API Gateway routes
app.use('/api', apiRouter);

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Realtime Gateway on the same HTTP server
realtimeGateway.initialize(httpServer);

// Start server
httpServer.listen(config.port, config.host, () => {
  console.log(`
\x1b[36m╭─\x1b[1m 🚀 OMEGLE NEXT BACKEND SERVER \x1b[0m\x1b[36m────────────────────────────────────────\x1b[0m
\x1b[36m│\x1b[0m   \x1b[2mPort         :\x1b[0m \x1b[1m${config.port}\x1b[0m
\x1b[36m│\x1b[0m   \x1b[2mEnvironment  :\x1b[0m \x1b[32m${config.env}\x1b[0m
\x1b[36m│\x1b[0m   \x1b[2mREST API     :\x1b[0m \x1b[34mhttp://${config.host}:${config.port}/api\x1b[0m
\x1b[36m│\x1b[0m   \x1b[2mWebSocket    :\x1b[0m \x1b[35mws://${config.host}:${config.port}/ws\x1b[0m
\x1b[36m│\x1b[0m   \x1b[2mHealth Check :\x1b[0m \x1b[32mhttp://${config.host}:${config.port}/health\x1b[0m
\x1b[36m╰────────────────────────────────────────────────────────\x1b[0m
`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Server] Gracefully shutting down...');
  httpServer.close(() => {
    console.log('[Server] HTTP and WebSocket connections closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
