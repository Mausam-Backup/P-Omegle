import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/env.js';

export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

export function comparePassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash);
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiresIn });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.refreshTokenSecret);
  } catch (err) {
    return null;
  }
}
