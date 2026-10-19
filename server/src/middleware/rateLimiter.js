import { config } from '../config/env.js';

const ipRequests = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  let record = ipRequests.get(ip);
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + config.rateLimitWindowMs
    };
    ipRequests.set(ip, record);
    return next();
  }

  record.count++;
  if (record.count > config.rateLimitMaxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait a moment before trying again.'
    });
  }

  next();
}
