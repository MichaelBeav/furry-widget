var http = require('http')
  , libxml = require('libxmljs')
  , withDb = require('./db').getDb;

module.exports.run = run;

function run() {
  http.get('http://babadu.ru/export/yandex.php', function onRes(res) {
    var xmlString = ''
      , xmlDoc;
    console.log('res status', res.statusCode);
    if (res.statusCode !== 200) return console.log('bad response');
    res.setEncoding('utf8');
    res.on('data', function onData(chunk) {
      xmlString += chunk;
    });
    res.on('end', function () {
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
    db.collection('yml-offers', function (err, collection) {
      var offerListXml = xmlDoc.find('//offer');
      console.log('offers found', offerListXml.length);
      offerListXml.forEach(function (offerXml) {
        var offerJson = parseOfferXml(offerXml);
      })
    });
  });
}
