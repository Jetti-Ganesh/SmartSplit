const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verification.controller');

router.post('/send-otp/', verifyController.sendOtp);
router.post('/verify-otp', verifyController.verifyOtp);

module.exports = router;