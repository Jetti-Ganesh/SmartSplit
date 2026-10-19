const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
 getWalletTransactions,
 topUp,
 getSettlements,
 withdraw,
 sendMoney
} = require('../controllers/walletTransaction.controller.js');

router.use(protect);

router.get('/wallet', getWalletTransactions);
router.post('/wallet/topup', topUp);
router.post('/wallet/withdraw', withdraw);
router.post('/wallet/send', sendMoney);
router.post('/wallet/settle', getSettlements);

module.exports = router;
