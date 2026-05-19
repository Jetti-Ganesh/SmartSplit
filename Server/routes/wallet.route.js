const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
 getWalletTransactions,
 topUp,
 getSettlements,

} = require('../controllers/settleUp.controller');

router.use(protect);

router.get('/wallet', getWalletTransactions);
router.post('wallet/topup', topUp);
router.get('/settlements', getSettlements);

module.exports = router;
