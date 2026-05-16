const express = require('express');
const router = express.Router();
const { getAnalytics, seedExpenses } = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth');

router.get('/analytics', [protect], getAnalytics);
router.post('/analytics/seed', [protect], seedExpenses);

module.exports = router;
