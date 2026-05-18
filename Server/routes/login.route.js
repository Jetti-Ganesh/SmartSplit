const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

// POST /api/login
router.post('/login', authController.loginUser);

// POST /api/change-password
router.post('/change-password', protect, authController.changePassword);

// POST /api/enable-2fa
router.post('/enable-2fa', protect, authController.enable2FA);

// POST /api/disable-2fa
router.post('/disable-2fa', protect, authController.disable2FA);

module.exports = router;
