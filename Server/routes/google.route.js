const express = require('express');
const router = express.Router();
const googleController = require('../controllers/google.controller');

// POST /api/google-auth
router.post('/google-auth', googleController.googleAuth);

module.exports = router;
