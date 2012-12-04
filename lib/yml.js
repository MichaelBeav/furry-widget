var http = require('http')
  , libxml = require('libxmljs')
  , withDb = require('./db').getDb
  , Iconv = require('iconv').Iconv
  , buffertools = require('buffertools')
  , _ = require('underscore');

module.exports.run = run;

var iconv = new Iconv('windows-1251', 'utf8');

function run() {
  http.get('http://babadu.ru/export/yandex.php', function onRes(res) {
    var xmlBuffer = new Buffer(0)
      , xmlString
      , xmlDoc;
    console.log('res status', res.statusCode);
    if (res.statusCode !== 200) return console.log('bad response');
    res.on('data', function onData(chunk) {
      xmlBuffer = xmlBuffer.concat(chunk);
    });
    res.on('end', function () {
      xmlString = iconv.convert(xmlBuffer).toString();
      console.log('Xml loaded, string length: ' + xmlString.length);
      xmlDoc = libxml.parseXml(xmlString);
      console.log('parsing finished.. saving..');
      saveYml(xmlDoc);
    });
  });
}

function parseOfferXml(offerXml) {
  var offerJson = {};

  offerXml.attrs().forEach(function (attr) {
    offerJson['@' + attr.name()] = attr.value();
  });

  offerXml.childNodes().filter(function (node) {
    return node.name() !== 'text';
  }).forEach(function (node) {
    var nodeName = node.name(), nodeValue = node.text();
    if (!offerJson[nodeName]) return offerJson[nodeName] = [nodeValue];
    offerJson[nodeName] = offerJson[nodeName].concat(nodeValue);
  });

  _.pairs(offerJson)
    .filter(function (kv) {
      return _.isArray(kv[1]) && kv[1].length === 1;
    })
    .forEach(function (kv) {
      offerJson[kv[0]] = kv[1][0];
    });
  return offerJson;
}

function saveYml(xmlDoc) {
  withDb(function (err, db) {
    if (err) return console.error(err);
    db.collection('offers', function (err, collection) {
      var offerListXml = xmlDoc.find('//offer').slice(0, 20);
      console.log('offers found', offerListXml.length);
      offerListXml.forEach(function (offerXml) {
        var offerJson = parseOfferXml(offerXml);
        // save or update
        collection.findAndModify({"@id": offerJson["@id"]},
          [['_id','asc']],
          {$set: offerJson},
          {upsert: true, new: true}, console.log);
      })
    });
  });
}
