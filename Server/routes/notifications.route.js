const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getNotifications } = require('../controllers/notifications.controller');

router.get('/notifications', [protect], getNotifications);

module.exports = router;
