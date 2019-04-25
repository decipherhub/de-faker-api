const Web3 = require('web3');
const INFURA_URL = "wss://mainnet.infura.io/ws"; 
const request = require('request');
const web3 = new Web3( new Web3.providers.WebsocketProvider(INFURA_URL));

const models = require('../../db/models');

let scanEndpoint = "https://api.etherscan.io/api?module=contract&action=getabi&address=";

const erc20abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]

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
          dataDict['senderAddress'] = result.returnValues.user;
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
  let contract = new web3.eth.Contract(erc20abi, contractAddress);

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
}

const getWalletList = async (req, res) => {
  let contractAddress = req.params.contractAddress;

  let fromBlock = req.params.fromBlock;
  let toBlock = req.params.toBlock;
  let blockInfo;

  for(let i = fromBlock; i <= toBlock; i++){
    blockInfo = await web3.eth.getBlock(i);
    transactions = blockInfo.transactions;
    transactions.forEach((transaction) => {
      web3.eth.getTransaction(transaction).then((receipt) => {
        if(receipt.from === contractAddress || receipt.to === contractAddress){
          models.ActiveUser.create({
            transactionHash: transaction,
            blockNumber: i,
            fromAddress: receipt.from,
            toAddress: receipt.to
          }).then(activeUser => {
            console.log('Successfully create Active user(not sender)');
          });
        }
      });
    });
    console.log('Running Get Wallet List');
  }
  res.status(200).json({
    'resMessage': 'Finish Getting last 30days Active user list'
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
          amountBuy = web3.utils.hexToNumberString('0x' + receipt.input.slice(10, 74));
          amountSell = web3.utils.hexToNumberString('0x' + receipt.input.slice(74, 138));
          amount = web3.utils.hexToNumberString('0x' + receipt.input.slice(266, 330));
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


module.exports = {
  getDepositEvents, getWithdrawEvents, startTransferTracking, getWalletList,
  getTraderList, getBlockInfo
}
