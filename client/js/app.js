$(function () {
  var AD_TMPL = $('script#ad-template').html();

  getAds(function onGetAdComplete(error, ads) {
    if (error) return console.error(error);

    ads["ads"].forEach(function renderAdd(ad, i) {
      $('div.ad-container').prepend(Mustache.render(AD_TMPL, ad));
    });
    
    // slidejs
    var slides = $('div.slides').slides({
      play: 4000,
      preload: true,
      pagination: false,
      generatePagination: false,
      hoverPause: true
    });
  });


  function getAds(callback) {
    var queryParams = window.url
    return $.ajax('/api/ads' + window.location.search)
      .success(function (data) {
        return callback(null, data);
      })
      .error(function (err) {
        return callback(err);
      });
  }
});
