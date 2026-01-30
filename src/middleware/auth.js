const TokenService = require('../services/tokenService');
const { UserRepository } = require('../database/repositories');

const authenticate = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); 

    const decoded = TokenService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        code: 'INVALID_TOKEN',
      });
    }

    const user = UserRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      isVerified: Boolean(user.is_verified),
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = TokenService.verifyAccessToken(token);

      if (decoded) {
        const user = UserRepository.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            isVerified: Boolean(user.is_verified),
          };
        }
      }
    }

    next();
  } catch (error) {

    next();
  }
};

const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  requireVerified,
};
