var http = require('http')
  , libxml = require('libxmljs')
  , withDb = require('./db').getDb
  , Iconv = require('iconv').Iconv
  , buffertools = require('buffertools');

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
  offerXml.childNodes().forEach(function (node) {
    var nodeJson = {};
    nodeJson.text = node.text();
    node.attrs().forEach(function (attr) {
      nodeJson['@' + attr.name()] = attr.value();
    });
    offerJson[node.name()] = nodeJson;
  });
  return offerJson;
}

function saveYml(xmlDoc) {
  withDb(function (err, db) {
    if (err) return console.error(err);
    db.collection('offers', function (err, collection) {
      var offerListXml = xmlDoc.find('//offer');
      console.log('offers found', offerListXml.length);
      offerListXml.slice(0,2).forEach(function (offerXml) {
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
