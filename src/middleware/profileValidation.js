const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('profile_photo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile photo must be a valid URL'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]{7,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  validate,
];

const adminUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Status must be active, inactive, suspended, or pending'),
  body('profile_photo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile photo must be a valid URL'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]{7,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified must be a boolean'),
  validate,
];

module.exports = {
  profileValidation,
  adminUpdateValidation,
};
