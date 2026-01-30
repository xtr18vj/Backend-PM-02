const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

class TokenService {

  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  static generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.accessSecret);
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }

  static getRefreshTokenExpiry() {
    const days = parseInt(config.jwt.refreshExpiry) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate.toISOString();
  }

  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static getVerificationTokenExpiry() {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    return expiryDate.toISOString();
  }

  static getPasswordResetTokenExpiry() {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    return expiryDate.toISOString();
  }
}

module.exports = TokenService;
