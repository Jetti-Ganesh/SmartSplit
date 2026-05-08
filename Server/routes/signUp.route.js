const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/signup
router.post('/signUp', authController.signUpUser);

module.exports = router;