const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  profileValidation,
  adminUpdateValidation,
} = require('../middleware/profileValidation');
const { UserRepository } = require('../database/repositories');

router.get('/profile', authenticate, (req, res) => {
  try {
    const user = UserRepository.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const { password_hash, ...profile } = user;
    
    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      code: 'PROFILE_ERROR',
    });
  }
});

router.put('/profile', authenticate, profileValidation, (req, res) => {
  try {
    const { name, profile_photo, phone, bio } = req.body;
    
    const updatedUser = UserRepository.updateProfile(req.user.id, {
      name,
      profile_photo,
      phone,
      bio,
    });

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
        code: 'NO_FIELDS',
      });
    }

    const { password_hash, ...profile } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: profile },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      code: 'UPDATE_ERROR',
    });
  }
});

router.get('/profile/:userId', authenticate, (req, res) => {
  try {
    const profile = UserRepository.getPublicProfile(req.params.userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      code: 'PROFILE_ERROR',
    });
  }
});

router.get('/admin/users', authenticate, requireAdmin, (req, res) => {
  try {
    const { limit, offset, status, role } = req.query;
    
    const users = UserRepository.findAll({
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      status: status || null,
      role: role || null,
    });

    res.json({
      success: true,
      data: { users, count: users.length },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      code: 'FETCH_ERROR',
    });
  }
});

router.get('/admin/users/:userId', authenticate, requireAdmin, (req, res) => {
  try {
    const user = UserRepository.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      code: 'FETCH_ERROR',
    });
  }
});

router.put('/admin/users/:userId', authenticate, requireAdmin, adminUpdateValidation, (req, res) => {
  try {
    const { name, email, role, status, profile_photo, phone, bio, is_verified } = req.body;
    
    const existingUser = UserRepository.findById(req.params.userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = UserRepository.findByEmail(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
          code: 'EMAIL_EXISTS',
        });
      }
    }

    const updatedUser = UserRepository.adminUpdate(req.params.userId, {
      name,
      email,
      role,
      status,
      profile_photo,
      phone,
      bio,
      is_verified: is_verified ? 1 : (is_verified === false ? 0 : undefined),
    });

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
        code: 'NO_FIELDS',
      });
    }

    const { password_hash, ...userData } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userData },
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      code: 'UPDATE_ERROR',
    });
  }
});

router.delete('/admin/users/:userId', authenticate, requireAdmin, (req, res) => {
  try {
    const user = UserRepository.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
        code: 'SELF_DELETE',
      });
    }

    UserRepository.delete(req.params.userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      code: 'DELETE_ERROR',
    });
  }
});

module.exports = router;
