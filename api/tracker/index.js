const express = require('express');
const router = express.Router();
const ctrl = require('./tracker.ctrl');

var _ = require('lodash');
var jwt = require('jsonwebtoken');

const API_HEADERS = {
  JWT_TOKEN: 'jwt-token',
  JWT_CONSUMER: 'jwt-consumer'
};

const MESSAGES = {
  NOT_FOUND: 'Valid headers not present',
  TOKEN_EXPIRES: 'Downloasd token expired',
  NOT_VALID_CLIENT: 'Not a valid client',
};

const SECRETS = {
  'de-faker-web': 'secret',
}

const JWTVerifier = async (req, res, next) => {
  const jwtToken = req.headers[API_HEADERS.JWT_TOKEN];
  const jwtConsumer = req.headers[API_HEADERS.JWT_CONSUMER];
  const payload = {};

  console.log('jwtToken: ' + jwtToken);
  console.log('jwtConsumer: ' + jwtConsumer);

  if(!jwtToken || !jwtConsumer){
    return res.status(400).json({message: MESSAGES.NOT_FOUND});
  }

  try {
    const secret = SECRETS[jwtConsumer];
    if(!secret){
      return res.status(403).json({
        message: MESSAGES.NOT_VALID_CLIENT
      });
    }
    try{
      jwt.verify(jwtToken, secret); // verify only token not data.
      return next();
    } catch(err){
      console.log(err);
      return res.status(403).json({
        messages: MESSAGES.NOT_FOUND
      });
    }
  } catch(error){
    return next(error);
  }
}

router.get('/event/:contractAddress/deposit', JWTVerifier, ctrl.getDepositEvents);
router.get('/event/:contractAddress/withdraw', JWTVerifier, ctrl.getWithdrawEvents);
router.get('/event/:contractAddress/trade/:fromBlock/:toBlock', JWTVerifier, ctrl.getTraderList);
router.get('/event/:contractAddress/users', JWTVerifier, ctrl.getActiveUsers);

router.get('/event/:contractAddress', JWTVerifier, ctrl.startTransferTracking);

router.get('/block/:fromBlock/:toBlock', JWTVerifier, ctrl.getBlockInfo);

router.get('/subscribe/:contractAddress/transactions/pending', JWTVerifier, ctrl.subscribePending);
router.get('/unsubscribe/:contractAddress/transactions/pending', JWTVerifier, ctrl.unsubscribePending);

router.get('/subscribe/event/:contractAddress/deposit', JWTVerifier, ctrl.depositTracking);
router.get('/subscribe/event/:contractAddress/withdraw', JWTVerifier, ctrl.withdrawTracking);

module.exports = router;
