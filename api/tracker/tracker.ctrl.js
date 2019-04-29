const Web3 = require('web3');
const INFURA_URL = "wss://mainnet.infura.io/ws"; 
const request = require('request');
const web3 = new Web3( new Web3.providers.WebsocketProvider(INFURA_URL));

const paginate = require('express-paginate');

const models = require('../../db/models');

let scanEndpoint = "https://api.etherscan.io/api?module=contract&action=getabi&address=";
let subscription;

const getDepositEvents = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  let lastBlockNumber = await web3.eth.getBlockNumber();
  let firstBlockNumber = lastBlockNumber - 129600;
  request.get({url: scanEndpoint}, (err, respone, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    let bulkArray = [];
    let dataDict;

    for(let i = firstBlockNumber; i <= lastBlockNumber; i+=3000){
      contract.getPastEvents('Deposit', {
        fromBlock: i,
        toBlock: i+3000
      }, (error, events) => {
        events.forEach((result) => {
          dataDict = {}
          dataDict['transactionHash'] = result.transactionHash;
          dataDict['senderAddress'] = result.returnValues.user;
          dataDict['tokenAddress'] = result.returnValues.token;
          dataDict['amount'] = parseInt(result.returnValues.amount._hex) / 1000000000000000000;
          bulkArray.push(dataDict);
        });
        models.DepositEvent.bulkCreate(bulkArray).then(() => {
          console.log('Successfully bulk insert for deposit event');
        }).catch((err) => {
          console.log('Occur fucked error !! ' + err);  
        });
        bulkArray = [];
      });
      console.log('Running get Deposit Event');
    }
    res.status(200).json({
      'resMessage': 'Successfully call function'
    });
  });
}

const getActiveUsers = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  let lastBlockNumber = await web3.eth.getBlockNumber();
  let firstBlockNumber = lastBlockNumber - 129600;
  request.get({url: scanEndpoint}, (err, respone, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    let bulkArray = [];
    let dataDict;

    for(let i = firstBlockNumber; i <= lastBlockNumber; i+=3000){
      contract.getPastEvents('Deposit', {
        fromBlock: i,
        toBlock: i+3000
      }, (error, events) => {
        //console.log(events);
      })
      .then((events) => {
        events.forEach((result) => {
          dataDict = {};
          dataDict['transactionHash'] = result.transactionHash;
          dataDict['fromAddress' ] = result.returnValues.user;
          dataDict['toAddress'] = result.address;
          bulkArray.push(dataDict);
        });
        models.ActiveUser.bulkCreate(bulkArray).then(() => {
          console.log('Successfully bulk insert for active user');
        }).then((err) => {
          console.log('Successfully fucked error ' + err);
        });
        bulkArray = [];
      });
      console.log('Running get Deposit Event for Getting active users');
    }
    res.status(200).json({
      'resMessage': 'Successfully call function'
    });
  });
}



const getWithdrawEvents = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  let lastBlockNumber = await web3.eth.getBlockNumber();
  let firstBlockNumber = lastBlockNumber - 129600;
  request.get({url: scanEndpoint}, (err, respone, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    let bulkArray = [];
    let dataDict;

    for(let i = firstBlockNumber; i <= lastBlockNumber; i+=3000){
      contract.getPastEvents('Withdraw', {
        fromBlock: i,
        toBlock: i+3000
      }, (error, events) => {
        events.forEach((result) => {
          dataDict = {}
          dataDict['transactionHash'] = result.transactionHash;
          dataDict['receiverAddress'] = result.returnValues.user;
          dataDict['tokenAddress'] = result.returnValues.token;
          dataDict['amount'] = parseInt(result.returnValues.amount._hex) / 1000000000000000000;
          bulkArray.push(dataDict);
        });
        models.WithdrawEvent.bulkCreate(bulkArray).then(() => {
          console.log('Successfully bulk insert for withdraw event');
        });
        bulkArray = [];
      });
      console.log('Running Get Withdraw Event !');
    }
    res.status(200).json({
      'resMessage': 'Successfully call function'
    });
  });
}


const startTransferTracking = (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  request.get({url: scanEndpoint}, (err, response, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    contract.events.Transfer({
      fromBlock: 'latest',
    }, (err, res) => {
      console.log(res);
    })
    .on('data', (res) => {
      console.log(res);
    })
    .on('changed', (res) => {
      console.log(res);
    })
    .on('error', console.error);

    res.status(200).json({
      'resMessage': 'start Transfer Tracking'
    });
  });
}


const depositTracking = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  request.get({url: scanEndpoint}, (err, response, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    contract.events.Deposit({
      fromBlock: 'latest',
    }, (err, res) => {
      //console.log(res);
    })
    .on('data', (res) => {
      console.log(res);
      models.DepositEvent.create({
        transactionHash: res.transactionHash,
        senderAddress: res.returnValues.user,
        tokenAddress: res.returnValues.token,
        amount: parseInt(res.returnValues.amount._hex) / 1000000000000000000
      }).then(dEvent => {
        console.log('Successfully insert new deposit event');  
      });
    }) 
    res.status(200).json({
      'resMessage': 'Start Deposit Event Tracking'
    }); 
  });
}


const withdrawTracking = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  scanEndpoint = scanEndpoint + contractAddress;

  request.get({url: scanEndpoint}, (err, response, body) => {
    let contractABI = JSON.parse(body).result;
    let jsonABI = JSON.parse(contractABI);
    let contract = new web3.eth.Contract(jsonABI, contractAddress);
    contract.events.Withdraw({
      fromBlock: 'latest'
    }, (err, res) => {
      //console.log(res);
    })
    .on('data', (res) => {
      console.log(res);
      models.WithdrawEvent.create({
        transactionHash: res.transactionHash,
        receiverAddress: res.returnValues.user,
        tokenAddress: res.returnValues.token,
        amount: parseInt(res.returnValues.amount._hex) / 1000000000000000000
      }).then(wEvent => {
        console.log('Successfully insert new withdraw event');
      });
    })
    res.status(200).json({
      'resMessage': 'Start Withdraw Event Tracking'
    });
  });
}



const getTraderList = async (req, res) => {
  let fromBlock = req.params.fromBlock;
  let toBlock = req.params.toBlock;
  
  let blockInfo;

  let amountBuy;
  let amountSell;
  let amount;

  let tokenBuyAddress;
  let tokenSellAddress;
  let makerAddress;
  let takerAddress;

  for(let i = fromBlock; i <= toBlock; i++){
    blockInfo = await web3.eth.getBlock(i);
    transactions = blockInfo.transactions;
    transactions.forEach((transaction) => {
      web3.eth.getTransaction(transaction).then((receipt) => {
        if(receipt.input.slice(0,10) === "0xef343588"){ // trade function signature
          console.log('Match Trade Function !');
          amountBuy = web3.utils.hexToNumberString('0x' + receipt.input.slice(10, 74)) / 1000000000000000000;
          amountSell = web3.utils.hexToNumberString('0x' + receipt.input.slice(74, 138)) / 1000000000000000000;
          amount = web3.utils.hexToNumberString('0x' + receipt.input.slice(266, 330)) / 1000000000000000000;
          tokenBuyAddress = receipt.input.slice(546 ,586);
          tokenSellAddress = receipt.input.slice(610 ,650);
          makerAddress = receipt.input.slice(674, 714);
          takerAddress = receipt.input.slice(738, 778);
          models.TradeEvent.create({
            transactionHash: transaction,
            amountBuy: amountBuy,
            amountSell: amountSell,
            amount: amount,
            tokenBuyAddress: tokenBuyAddress,
            tokenSellAddress: tokenSellAddress,
            maker: makerAddress,
            taker: takerAddress 
          }).then(trade => {
            console.log('Successfully create trade history');
          });
        }
      });
    });
    console.log('Running Trader function');
  }
}


const getBlockInfo = async (req, res) => {
  let fromBlock = req.params.fromBlock;
  let toBlock = req.params.toBlock;
  
  let blockInfo;

  for(let i = fromBlock; i <= toBlock; i++){
    blockInfo = await web3.eth.getBlock(i);
    models.BlockInfo.create({
      blockHash: blockInfo.hash,
      blockNumber: i, 
      transactionList: JSON.stringify(JSON.stringify(blockInfo.transactions))
    }).then(block => {
      console.log('Successfully create block !');
    });
  }
  res.status(200).json({
    'resMessage': 'Successfully Get Block Information'
  });
}

const subscribePending = async (req, res) => {
  let contractAddress = req.params.contractAddress;
  let amountBuy;
  let amountSell;
  let amount;

  let tokenBuyAddress;
  let tokenSellAddress;
  let makerAddress;
  let takerAddress;
  subscription = web3.eth.subscribe('pendingTransactions', (err, res) => {
    if(!error){
      //console.log(res);
    }
  })
  .on("data", (transaction) => {
    web3.eth.getTransaction(transaction).then((receipt) => {
      if(receipt !== null){
        if( (receipt.from === contractAddress || receipt.to === contractAddress) ){
          models.ActiveUser.create({
            transactionHash: transaction,
            fromAddress: receipt.from,
            toAddress: receipt.to 
          }).then((activeUser) => {
            console.log('Successfully insert active user from pendingTransaction');
          });
          if(receipt.input.slice(0,10) === "0xef343588"){ // trade function signature
            amountBuy = web3.utils.hexToNumberString('0x' + receipt.input.slice(10, 74)) / 1000000000000000000;
            amountSell = web3.utils.hexToNumberString('0x' + receipt.input.slice(74, 138)) / 1000000000000000000;
            amount = web3.utils.hexToNumberString('0x' + receipt.input.slice(266, 330)) / 1000000000000000000;
            tokenBuyAddress = receipt.input.slice(546 ,586);
            tokenSellAddress = receipt.input.slice(610 ,650);
            makerAddress = receipt.input.slice(674, 714);
            takerAddress = receipt.input.slice(738, 778);
            models.TradeEvent.create({
              transactionHash: transaction,
              amountBuy: amountBuy,
              amountSell: amountSell,
              amount: amount,
              tokenBuyAddress: tokenBuyAddress,
              tokenSellAddress: tokenSellAddress,
              maker: makerAddress,
              taker: takerAddress 
            }).then(trade => {
              console.log('Successfully create trade history');
            });
          }
        }
      }
    });
  });
  res.status(200).json({
    'resMessage': 'Start Subscribing pendingTransaction!'
  });
}

const unsubscribePending = async (req, res) => {
  subscription.unsubscribe((err, success) => {
    if(success){
      console.log('Successfully unsubscribed!');
    }
    else{
      console.log('failed unsubscribed!');
    }
  });
  res.status(200).json({
    'resMessage': 'Successfully unsubscribe'
  });
}


module.exports = {
  getDepositEvents, getWithdrawEvents, startTransferTracking,
  getTraderList, getBlockInfo, getActiveUsers,
  subscribePending, unsubscribePending, depositTracking, withdrawTracking
}
