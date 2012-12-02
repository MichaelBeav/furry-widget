var express = require('express');

var app = express()
  .use(express.static('client'))
  .listen(3000);


