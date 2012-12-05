var express = require('express')
  , withCollection = require('./lib/db').withCollection;

var app = express()
  .use(express.static('client'))
  .use(express.query())
  .get('/api/ads', function (req, res, next) {
    withCollection('offers', function (err, collection) {
      var query = {}
        , mongoQuery = {}
        , $or = []
        , r;
      if (err) return next(err);
      query = req.query;

      if (query['q']) {
        r = new RegExp('^.*' + query['q'] + '.*$', "i");
        $or.push({ 'name' : r });
        $or.push({'description' : r });
        mongoQuery['$or'] = $or;
      }

      collection.find(mongoQuery).limit(20).toArray(function (err, arr) {
        if (err) return next(err);
        res.header({
          'Content-Type': 'application/json; charset=utf-8'
        });
        return res.end(JSON.stringify({ads: arr}));
      });
    });
  }).listen(process.env.PORT || 3000);


