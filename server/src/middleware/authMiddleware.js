import { verifyAccessToken } from '../services/identity/tokenUtils.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }

  req.user = decoded;
  next();
}

export function requireModerator(req, res, next) {
  if (!req.user || !req.user.isModerator) {
    return res.status(403).json({ error: 'Forbidden: Moderator privileges required' });
  }
  next();
}
