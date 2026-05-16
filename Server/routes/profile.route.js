const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

console.log('Profile routes loaded');

// Get user profile (protected)
router.get('/', protect, getProfile);

// Update user profile (protected)
router.put('/', protect, updateProfile);

module.exports = router;
