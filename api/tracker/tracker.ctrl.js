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

    for(let i = firstBlockNumber; i <= lastBlockNumber; i+=100){
      contract.getPastEvents('Deposit', {
        fromBlock: i,
        toBlock: i+100
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
        });
        bulkArray = [];
      });
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

    for(let i = firstBlockNumber; i <= lastBlockNumber; i+=100){
      contract.getPastEvents('Withdraw', {
        fromBlock: i,
        toBlock: i+100
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
  scanEndpoint = scanEndpoint + contractAddress;

  let contract = new web3.eth.Contract(erc20abi, contractAddress);
  
  let lastBlockNumber = await web3.eth.getBlockNumber();
  let firstBlockNumber = lastBlockNumber - 129600;
  let blockInfo;
  let index;

  for(let i = firstBlockNumber; i <= lastBlockNumber; i++){
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
    console.log(blockInfo);
  }
  res.status(200).json({
    'resMessage': 'Finish Getting last 30days Active user list'
  });
}

module.exports = {
  getDepositEvents, getWithdrawEvents, startTransferTracking, getWalletList
}
