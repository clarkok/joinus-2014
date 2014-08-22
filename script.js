"use strict";

(function (w, $) {
  var config = {
    duration: 3000,
    radius: 2000,
    delay: 15
  };

  var Circle = function (fill_style, x, y, start) {
    this.fill_style = fill_style;
    this.x = x;
    this.y = y;
    this.start = start;
  };

  var Background = function (id) {
    var _this = this;
    _this.id = id;
    _this.target = w.document.getElementById(id);
    _this.circle_list = [];
    _this.context = _this.target.getContext("2d");
    _this.buffer = w.document.createElement('canvas');
    _this.buffer_context = _this.buffer.getContext("2d");

    if (! _this.target)
      return;
    $(w).on('resize', function () {
      _this.width = $(w).width();
      _this.height = $(w).height();
      _this.buffer.width = _this.target.width = _this.width;
      _this.buffer.height = _this.target.height = _this.height;
    }).trigger('resize');
  };

  Background.prototype.addCircle = function (circle) {
    this.circle_list.push(circle);
    var _this = this;
    if (this.circle_list.length == 1)
      this.r = w.setInterval(function () {
        _this.draw();
      }, config.delay);
  };

  Background.prototype.check = function () {
    var current = new Date();
    var list = this.circle_list;
    var l = list.length, len = 0;
    var duration = config.duration;
    for (len = 0; len < l; ++len)
      if (current - list[len].start < duration)
        break;
    list.splice(0, len);

    if (list.length <= 0)
      w.clearInterval(this.r);
  };

  Background.prototype.draw = function () {
    this.check();
    var current = new Date();
    var list = this.circle_list;
    var l = list.length;
    var cxt = this.buffer_context;
    for (var i = 0; i < l; i++) {
      var e = list[i];
      var radius = this.calcRadius(current - e.start);
      cxt.fillStyle = e.fill_style;
      cxt.beginPath();
      cxt.arc(e.x, e.y, radius, 0, w.Math.PI * 2, true);
      cxt.fill();
    }

    this.context.drawImage(this.buffer, 0, 0);
  };

  Background.prototype.calcRadius = function (duration) {
    return -(Math.pow((duration / config.duration -1), 4) -1) * config.radius;
  };

  w.Background = Background;
  w.Circle = Circle;
})(window, window.jQuery);

(function (w, $) {
  $(w).on('hashchange', function () {
    var hash = w.location.hash;
    if (hash.length)
      $('body').removeClass('ready').addClass(hash.substring(8));
    else {
      $('body').get(0).className = "ready";
    }
  }).trigger('hashchange');

  var bg = new w.Background('background');

  $('.item').on('mouseenter', function () {
    var x = $(this).offset().left + 50;
    var y = $(this).offset().top + 50;
    var color = $(this).data('color');

    bg.addCircle(new w.Circle(color, x, y, new Date()));
  });

})(window, window.jQuery)
