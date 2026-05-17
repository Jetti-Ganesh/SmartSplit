const express = require('express');
const router = express.Router();
const { sendResetOtp, verifyResetOtp, resetPassword } = require('../controllers/forgotPassword.controller');

router.post('/forgot-password', sendResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
