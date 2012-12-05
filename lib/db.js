var mongo = require('mongodb')
  , logging = {debug: console.log, err: console.error }
  , mongoUri = process.env.MONGOLAB_URI || 
               process.env.MONGOHQ_URL || 
               'mongodb://localhost/adwidget'
  , instances = [];

module.exports.getDb = getDb;
module.exports.findOne = findOne;
module.exports.withCollection = withCollection;

function getDb(callback) {
  if (instances.length > 0) return callback(null, instances[0]);
  mongo.Db.connect(mongoUri, function dbOpen(err, db) {
      if (err) return callback(err);
      logging.debug('connection opened.');
      instances.push(db);
      callback(null, db);
    });
}

function findOne(collection, query, callback) {
  getDb(function findCollection(err, db) {
    if (err) return callback(err);
    db.collection(collection, function dbCollection(err, collection) {
      collection.findOne(query, function(err, permission) {
        return callback(err, permission);
      });
    });
    
  });
}

function withCollection(name, f) {
  getDb(function findCollection(err, db) {
    db.collection(name, f);
  });
}


