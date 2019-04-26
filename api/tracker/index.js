const express = require('express');
const router = express.Router();
const ctrl = require('./tracker.ctrl');

router.get('/event/:contractAddress/deposit', ctrl.getDepositEvents);
router.get('/event/:contractAddress/withdraw', ctrl.getWithdrawEvents);
router.get('/event/:contractAddress/trade/:fromBlock/:toBlock', ctrl.getTraderList);
router.get('/event/:contractAddress/users', ctrl.getActiveUsers);

router.get('/event/:contractAddress', ctrl.startTransferTracking);

router.get('/block/:fromBlock/:toBlock', ctrl.getBlockInfo);

router.get('/subscribe/:contractAddress/transactions/pending', ctrl.subscribePending);
router.get('/unsubscribe/:contractAddress/transactions/pending', ctrl.unsubscribePending);

module.exports = router;
