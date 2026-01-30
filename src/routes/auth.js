const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const config = require('../config');
const TokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const { authenticate, requireVerified } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
} = require('../middleware/validation');
const {
  UserRepository,
  RefreshTokenRepository,
  VerificationTokenRepository,
  PasswordResetTokenRepository,
} = require('../database/repositories');

router.post('/register', registerValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    const user = UserRepository.create(email, passwordHash);

    const verificationToken = TokenService.generateVerificationToken();
    const expiresAt = TokenService.getVerificationTokenExpiry();
    VerificationTokenRepository.create(user.id, verificationToken, expiresAt);

    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR',
    });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
        code: 'NO_TOKEN',
      });
    }

    const verificationRecord = VerificationTokenRepository.findByToken(token);

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN',
      });
    }

    UserRepository.verify(verificationRecord.user_id);

    VerificationTokenRepository.markUsed(verificationRecord.id);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      code: 'VERIFICATION_ERROR',
    });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = UserRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = TokenService.generateRefreshToken();
    const refreshTokenHash = TokenService.hashToken(refreshToken);
    const refreshTokenExpiry = TokenService.getRefreshTokenExpiry();

    RefreshTokenRepository.create(user.id, refreshTokenHash, refreshTokenExpiry);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          isVerified: Boolean(user.is_verified),
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: config.jwt.accessExpiry,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_ERROR',
    });
  }
});

router.post('/refresh', refreshTokenValidation, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokenHash = TokenService.hashToken(refreshToken);

    const storedToken = RefreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      RefreshTokenRepository.revoke(storedToken.id);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const user = UserRepository.findById(storedToken.user_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    RefreshTokenRepository.revoke(storedToken.id);

    const newAccessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = TokenService.generateRefreshToken();
    const newRefreshTokenHash = TokenService.hashToken(newRefreshToken);
    const newRefreshTokenExpiry = TokenService.getRefreshTokenExpiry();

    RefreshTokenRepository.create(user.id, newRefreshTokenHash, newRefreshTokenExpiry);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: config.jwt.accessExpiry,
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'REFRESH_ERROR',
    });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {

      const tokenHash = TokenService.hashToken(refreshToken);
      const storedToken = RefreshTokenRepository.findByTokenHash(tokenHash);
      if (storedToken) {
        RefreshTokenRepository.revoke(storedToken.id);
      }
    } else {

      RefreshTokenRepository.revokeAllForUser(req.user.id);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR',
    });
  }
});

router.post('/logout-all', authenticate, async (req, res) => {
  try {
    RefreshTokenRepository.revokeAllForUser(req.user.id);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR',
    });
  }
});

router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const { email } = req.body;

    const successResponse = {
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
    };

    const user = UserRepository.findByEmail(email);

    if (!user) {
      return res.json(successResponse);
    }

    PasswordResetTokenRepository.invalidateForUser(user.id);

    const resetToken = TokenService.generateVerificationToken();
    const resetTokenHash = TokenService.hashToken(resetToken);
    const expiresAt = TokenService.getPasswordResetTokenExpiry();

    PasswordResetTokenRepository.create(user.id, resetTokenHash, expiresAt);

    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json(successResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      code: 'FORGOT_PASSWORD_ERROR',
    });
  }
});

router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const { token, password } = req.body;

    const tokenHash = TokenService.hashToken(token);

    const resetRecord = PasswordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    UserRepository.updatePassword(resetRecord.user_id, passwordHash);

    PasswordResetTokenRepository.markUsed(resetRecord.id);

    RefreshTokenRepository.revokeAllForUser(resetRecord.user_id);

    res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      code: 'RESET_PASSWORD_ERROR',
    });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    if (req.user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        code: 'ALREADY_VERIFIED',
      });
    }

    const user = UserRepository.findById(req.user.id);

    const verificationToken = TokenService.generateVerificationToken();
    const expiresAt = TokenService.getVerificationTokenExpiry();
    VerificationTokenRepository.create(user.id, verificationToken, expiresAt);

    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      code: 'RESEND_ERROR',
    });
  }
});

module.exports = router;
