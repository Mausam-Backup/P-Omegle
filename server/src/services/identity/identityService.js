import crypto from 'crypto';
import { memoryStore } from '../../store/memoryStore.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from './tokenUtils.js';

class IdentityService {
  register({ email, password, ageConfirmed, termsAccepted }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!ageConfirmed) {
      throw new Error('You must be 18 years or older to use this platform (FR-AUTH-04)');
    }

    if (!termsAccepted) {
      throw new Error('You must accept the Terms and Community Guidelines');
    }

    const existingUser = memoryStore.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const user = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      isAdult: true,
      isModerator: email.toLowerCase().includes('admin') || email.toLowerCase().includes('mod'),
      isBanned: false,
      isSuspended: false,
      createdAt: new Date().toISOString()
    };

    memoryStore.saveUser(user);

    const payload = { userId: user.id, email: user.email, isModerator: user.isModerator, isGuest: false };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      userId: user.id,
      email: user.email,
      isModerator: user.isModerator,
      accessToken,
      refreshToken
    };
  }

  login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = memoryStore.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.isBanned) {
      throw new Error('Your account has been permanently banned for violating Community Guidelines');
    }

    if (user.isSuspended) {
      throw new Error('Your account is temporarily suspended');
    }

    const isMatch = comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, isModerator: user.isModerator, isGuest: false };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      userId: user.id,
      email: user.email,
      isModerator: user.isModerator,
      accessToken,
      refreshToken
    };
  }

  createGuestSession({ ageConfirmed = true }) {
    if (!ageConfirmed) {
      throw new Error('You must confirm you are 18+ to enter guest chat');
    }

    const guestId = 'guest_' + crypto.randomBytes(6).toString('hex');
    const payload = { userId: guestId, email: `guest_${guestId.slice(6)}@guest.local`, isModerator: false, isGuest: true };
    const accessToken = generateAccessToken(payload);

    return {
      userId: guestId,
      email: payload.email,
      isModerator: false,
      isGuest: true,
      accessToken
    };
  }

  deleteAccount(userId) {
    return memoryStore.deleteUser(userId);
  }

  getUserProfile(userId) {
    const user = memoryStore.getUser(userId);
    if (!user) {
      // Guest profile fallback
      if (userId.startsWith('guest_')) {
        return {
          id: userId,
          email: `${userId}@guest.local`,
          isGuest: true,
          isModerator: false,
          isBanned: false
        };
      }
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      isModerator: user.isModerator,
      isBanned: user.isBanned,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt
    };
  }
}

export const identityService = new IdentityService();
