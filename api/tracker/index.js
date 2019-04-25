const express = require('express');
const router = express.Router();
const ctrl = require('./tracker.ctrl');

router.get('/event/:contractAddress/deposit', ctrl.getDepositEvents);
router.get('/event/:contractAddress/withdraw', ctrl.getWithdrawEvents);
router.get('/event/:contractAddress/trade', ctrl.getTraderList);

router.get('/event/:contractAddress', ctrl.startTransferTracking);
router.get('/wallets/:contractAddress', ctrl.getWalletList);

module.exports = router;
