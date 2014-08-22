(function (w, $) {
  "use strict"

  $('.front').on('mouseenter', function () {
    $('.hover').removeClass('hover');
    $(this).parents('.item').addClass('hover');
  })
  .on('mouseleave', function () {
    $('.hover').removeClass('hover');
  });

  $(w).on('hashchange', function () {
    var hash = w.location.hash;
    console.log(hash.substring(8));
    if (hash.length)
      $('body').removeClass('ready').addClass(hash.substring(8));
    else {
      $('body').get(0).className = "ready";
    }
  }).trigger('hashchange');
})(window, window.jQuery)
