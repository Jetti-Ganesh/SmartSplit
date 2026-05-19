const express = require('express');
const { getProfile, updateProfile, verifyPhone, verifyEmail, verifyContact } = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.patch('/verify-phone', protect, verifyPhone);
router.patch('/verify-email', protect, verifyEmail);
router.patch('/verify-contact', protect, verifyContact);

module.exports = router;
