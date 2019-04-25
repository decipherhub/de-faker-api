const Sequelize = require('sequelize');

const faker_db = 'faker_db';
const db_username = 'root';
const db_password = 'tokenize';

const sequelize = new Sequelize(faker_db, db_username, db_password, {
    host: 'localhost',
    dialect: 'mysql'
  }
);

const ActiveUser = sequelize.define('ActiveUser', {
  transactionHash: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  blockNumber: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  fromAddress: {
    type: Sequelize.TEXT('long'),
    allowNull: false
  },
  toAddress: {
    type: Sequelize.TEXT('long'),
    allowNull: false
  }
})

const DepositEvent = sequelize.define('DepositEvent', {
  transactionHash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  senderAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tokenAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.DOUBLE,
    allowNull: false
  }
})

const WithdrawEvent = sequelize.define('WithdrawEvent', {
  transactionHash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  senderAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tokenAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.DOUBLE,
    allowNull: false
  }
})

const TradeEvent = sequelize.define('TradeEvent', {
  transactionHash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amountBuy: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  amountSell: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  amount: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  tokenBuyAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tokenSellAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  maker: {
    type: Sequelize.STRING,
    allowNull: false
  },
  taker: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = {Sequelize, sequelize, ActiveUser, DepositEvent, WithdrawEvent, TradeEvent}
