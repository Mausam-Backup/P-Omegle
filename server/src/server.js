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
=====================================================
  Omegle Random Video Chat Platform Backend Running
=====================================================
  Port:            ${config.port}
  Environment:     ${config.env}
  REST API:        http://localhost:${config.port}/api
  WebSocket Path:  ws://localhost:${config.port}/ws
  Health Check:    http://localhost:${config.port}/health
=====================================================
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
