const { UserRepository } = require('../database/repositories');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const user = UserRepository.findById(req.user.id);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED',
    });
  }

  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const user = UserRepository.findById(req.user.id);
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'ROLE_REQUIRED',
      });
    }

    next();
  };
};

module.exports = {
  requireAdmin,
  requireRole,
};
