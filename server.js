var express = require('express')
  , withCollection = require('./lib/db').withCollection;

var app = express()
  .use(express.static('client'))
  .get('/api/ads', function (req, res, next) {
    withCollection('offers', function (err, collection) {
      if (err) return next(err);
      collection.find().limit(20).toArray(function (err, arr) {
        if (err) return next(err);
        res.header({
          'Content-Type': 'application/json; charset=utf-8'
        });
        return res.end(JSON.stringify({ads: arr}));
      });
    });
  }).listen(process.env.PORT || 3000);


