var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');

var tracker = require('./api/tracker/index.js');

var cors = require('cors');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tokenize',
  database: 'faker_db'
});

conn.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send({status: 500, message: 'internal error', type: 'internal'});
});

app.use(cors());

app.use('/tracker', tracker);

module.exports = app;
