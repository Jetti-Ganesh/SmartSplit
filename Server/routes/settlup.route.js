const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getGroupBalances,
  recordSettlement,
  simplifyDebts
} = require('../controllers/settleUp.controller');

router.use(protect);

router.get('/:groupId/balances', getGroupBalances);
router.post('/', recordSettlement);
router.get('/:groupId/simplify', simplifyDebts);

module.exports = router;

// Add to app.js:
// app.use('/api/settlements', require('./routes/settlement.routes'));