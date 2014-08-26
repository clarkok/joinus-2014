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
    _this.color = '#eee';

    if (! _this.target)
      return;
    $(w).on('resize', function () {
      _this.width = $(w).width();
      _this.height = $(w).height();
      _this.buffer.width = _this.target.width = _this.width;
      _this.buffer.height = _this.target.height = _this.height;
      _this.draw();
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
    if (len) {
      this.color = list[len-1].fill_style;
    }
    list.splice(0, len);

    if (list.length <= 0)
      w.clearInterval(this.r);
  };

  Background.prototype.draw = function () {
    var current = new Date();
    var list = this.circle_list;
    var l = list.length;
    var cxt = this.buffer_context;
    cxt.fillStyle = this.color;
    cxt.fillRect(0, 0, this.width, this.height);
    for (var i = 0; i < l; i++) {
      var e = list[i];
      var radius = this.calcRadius(current - e.start);
      cxt.fillStyle = e.fill_style;
      cxt.beginPath();
      cxt.arc(e.x, e.y, radius, 0, w.Math.PI * 2, true);
      cxt.fill();
    }

    cxt.font = '256px sans-serif';
    cxt.textAlign = 'center';
    cxt.fillStyle = 'rgba(255, 255, 255, 0.2)';
    cxt.fillText('Incredible', this.width / 2, 64 + this.height / 2);

    this.context.drawImage(this.buffer, 0, 0);
    this.check();
  };

  Background.prototype.calcRadius = function (duration) {
    return -(Math.pow((duration / config.duration -1), 4) -1) * config.radius;
  };

  Background.prototype.react = function ($target) {
    var x = $target.offset().left + 50;
    var y = $target.offset().top + 50;
    var color = $target.data('color');

    this.addCircle(new Circle(color, x, y, new Date()));
  };

  w.Background = Background;
})(window, window.jQuery);

