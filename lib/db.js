var mongo = require('mongodb')
  , logging = {debug: console.log, err: console.error };

var server = new mongo.Server('localhost', 27017, {auto_reconnect: true}),
    instances = [];

module.exports.getDb = getDb;
module.exports.findOne = findOne;

function getDb(callback) {
  if (instances.length > 0) return callback(null, instances[0]);
  new mongo.Db('adtrack', server, {safe:true})
    .open(function dbOpen(err, db) {
      if (err) callback(err);
      logging.debug('connection opened.');
      instances.push(db);
      callback(null, db);
    });
}

function findOne(collection, query, callback) {
  getDb(function findCollection(err, db) {
    if (err) callback(err);
    db.collection(collection, function dbCollection(err, collection) {
      collection.findOne(query, function(err, permission) {
        return callback(err, permission);
      });
    });
    
  });
}


