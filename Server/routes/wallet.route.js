const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
 getWalletTransactions,
 topUp,
 getSettlements,
<<<<<<< HEAD
 withdraw,
 sendMoney
} = require('../controllers/walletTransaction.controller.js');
=======

} = require('../controllers/walletTransaction.controller');
>>>>>>> 069bee569d14aae943070fcf2b13ce4bbc84c7f5

router.use(protect);

router.get('/wallet', getWalletTransactions);
router.post('/wallet/topup', topUp);
<<<<<<< HEAD
router.post('/wallet/withdraw', withdraw);
router.post('/wallet/send', sendMoney);
router.post('/wallet/settle', getSettlements);
=======
router.get('/settlements', getSettlements);
>>>>>>> 069bee569d14aae943070fcf2b13ce4bbc84c7f5

module.exports = router;
