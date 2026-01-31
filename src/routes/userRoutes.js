const express = require('express');
const router = express.Router();
const { updateUserProfile } = require('../services/userService');
const { isAuthenticated } = require('../middleware/auth');

router.put('/update-profile', isAuthenticated, updateUserProfile);

module.exports = router;