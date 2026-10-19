import express from 'express';
import { identityService } from '../services/identity/identityService.js';
import { turnService } from '../services/turn/turnService.js';
import { presenceTracker } from '../services/presence/presenceTracker.js';
import { safetyManager } from '../services/safety/safetyManager.js';
import { moderationService } from '../services/moderation/moderationService.js';
import { authenticate, requireModerator } from '../middleware/authMiddleware.js';
import { verifyRefreshToken, generateAccessToken } from '../services/identity/tokenUtils.js';

export const apiRouter = express.Router();

// ==========================================
// 1. Identity & Auth Endpoints (FR-AUTH-01 to 07)
// ==========================================
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { email, password, ageConfirmed, termsAccepted } = req.body;
    const result = identityService.register({ email, password, ageConfirmed, termsAccepted });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = identityService.login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

apiRouter.post('/auth/guest', (req, res) => {
  try {
    const { ageConfirmed } = req.body;
    const result = identityService.createGuestSession({ ageConfirmed: ageConfirmed !== false });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    email: decoded.email,
    isModerator: decoded.isModerator,
    isGuest: decoded.isGuest
  });

  res.json({ accessToken: newAccessToken });
});

apiRouter.get('/me', authenticate, (req, res) => {
  const profile = identityService.getUserProfile(req.user.userId);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  res.json(profile);
});

apiRouter.delete('/me', authenticate, (req, res) => {
  identityService.deleteAccount(req.user.userId);
  res.json({ success: true, message: 'Account and associated data deleted' });
});

// ==========================================
// 2. TURN & WebRTC Credentials (FR-RTC-03)
// ==========================================
apiRouter.get('/turn-credentials', (req, res) => {
  const userId = req.user?.userId || req.query.userId || 'anonymous';
  const creds = turnService.getIceCredentials(userId, req.query.sessionId);
  res.json(creds);
});

// Public fallback for guest initialization
apiRouter.get('/public-ice-servers', (req, res) => {
  const creds = turnService.getIceCredentials('public', null);
  res.json(creds);
});

// ==========================================
// 3. Presence & Stats (FR-OME-09)
// ==========================================
apiRouter.get('/stats/online', (req, res) => {
  const stats = presenceTracker.getPublicStats();
  res.json(stats);
});

// ==========================================
// 4. Safety & Reporting (FR-SAFE-01, FR-SAFE-02)
// ==========================================
apiRouter.post('/reports', authenticate, (req, res) => {
  try {
    const { reportedId, sessionId, reason, comment } = req.body;
    const report = safetyManager.fileReport({
      reporterId: req.user.userId,
      reportedId,
      sessionId,
      reason,
      comment
    });
    res.status(201).json({ success: true, reportId: report.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/blocks', authenticate, (req, res) => {
  try {
    const { targetUserId } = req.body;
    const result = safetyManager.blockUser({
      userId: req.user.userId,
      targetUserId
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. Moderation Endpoints (FR-SAFE-04)
// ==========================================
apiRouter.get('/admin/reports', authenticate, requireModerator, (req, res) => {
  const reports = moderationService.getReportQueue();
  res.json({ reports });
});

apiRouter.post('/admin/users/:id/action', authenticate, requireModerator, (req, res) => {
  try {
    const { action, reason, reportId } = req.body;
    const result = moderationService.takeAction({
      moderatorId: req.user.userId,
      targetUserId: req.params.id,
      reportId,
      action,
      reason
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
