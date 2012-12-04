$(function () {
  var AD_TMPL = $('script#ad-template').html();

  getAds(function onGetAdComplete(error, ads) {
    if (error) return console.error(error);

    ads["ads"].forEach(function renderAdd(ad, i) {
      $('div.ad-container').prepend(Mustache.render(AD_TMPL, ad));
    });
    
    // slidejs
    $('div.slides').slides({
      play: 4000,
      pagination: false,
      generatePagination: false
    });
  });


  function getAds(callback) {
    return $.ajax('/api/ads')
      .success(function (data) {
        return callback(null, data);
      })
      .error(function (err) {
        return callback(err);
      });
    return callback(null, {
      "ads" : [{
        "picture": "https://www.google.ru/images/srpr/logo3w.png",
        "description": "Ad1 description."
      }, {
        "picture": "https://www.google.ru/images/srpr/logo3w.png",
        "description": "Ad2 description."
      }]});
  }
});
