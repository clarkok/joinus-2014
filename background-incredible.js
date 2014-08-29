"use strict";
(function (w, $) {
  Math = w.Math;

  var gen_progress_value = function (from, to, progress) {
    return progress * (from - to) + to;
  };

  var gen_point = function (offset, rad, radius) {
    return {
      x : offset + radius * Math.cos(rad),
      y : radius * Math.sin(rad)
    };
  };

  var config = {
    rotate_speed : 10000,
    color_duration : 1000,
    fan_nr : 12,
    poly_min : 3,
    poly_max : 36,
    poly_radius_max : 50,
    poly_radius_min : 20,
    radius_max : 800,
    radius_min : 400,
    duration : 2000,
    total : 3000
  };

  var Poly = function () {
    var c = config;
    this.start = new Date();
    this.poly_nr = Math.round(Math.random() * (c.poly_max - c.poly_min) + c.poly_min);
    if (this.poly_nr % 2 == 1 && (Math.random() * this.poly_nr > 3))
      ++this.poly_nr;

    this.double_radius = (this.poly_nr > 6 && (this.poly_nr % 2 === 0));

    this.distance = Math.random() * (c.radius_max - c.radius_min) + c.radius_min;
    this.distance_to = Math.random() * (c.radius_max - c.radius_min) + c.radius_min;

    if (this.double_radius) {
      this.radius_big = Math.random() * (c.poly_radius_max - c.poly_radius_min) + c.poly_radius_min;
      this.radius_small = Math.random() * (this.radius_big - c.poly_radius_min) + c.poly_radius_min / 2;
      this.radius_big_to = Math.random() * (c.poly_radius_max - c.poly_radius_min) + c.poly_radius_min;
      this.radius_small_to = Math.random() * (c.poly_radius_max - c.poly_radius_min) + c.poly_radius_min;
      this.rad = - Math.atan(this.radius_big / this.distance) - Math.PI / c.fan_nr;
      this.rad_to = Math.atan(this.radius_big_to / this.distance) + Math.PI / c.fan_nr;
    }
    else {
      this.radius = Math.random() * (c.poly_radius_max - c.poly_radius_min) + c.poly_radius_min;
      this.radius_to = Math.random() * (c.poly_radius_max - c.poly_radius_min) + c.poly_radius_min;
      this.rad = - Math.atan(this.radius / this.distance) - Math.PI / c.fan_nr;
      this.rad_to = Math.atan(this.radius_to / this.distance) + Math.PI / c.fan_nr;
    }
    console.log(this.rad, this.rad_to);
  };

  Poly.prototype.draw = function (cxt, time, reserve) {
    var progress = (time - this.start) / config.duration;
    var distance = gen_progress_value(this.distance, this.distance_to, progress);

    var rad_delta = Math.PI * 2 / this.poly_nr;
    var flag = (reserve ? -1 : 1);

    if (reserve) {
      var gen_point_wrapper = function (dis, rad, radius) {
        var res = gen_point(dis, rad, radius);
        res.y = -res.y;
        return res;
      }
    }
    else {
      var gen_point_wrapper = gen_point;
    }

    cxt.save();
    cxt.rotate(flag * gen_progress_value(this.rad, this.rad_to, progress));

    cxt.fillStyle = "#fff";

    cxt.beginPath();
    var rad = 0;

    if (this.double_radius) {
      var radius_big = gen_progress_value(this.radius_big, this.radius_big_to, progress);
      var radius_small = gen_progress_value(this.radius_small, this.radius_small_to, progress);

      var p = gen_point_wrapper(distance, 0, radius_big);
      cxt.moveTo(p.x, p.y);

      for (var i = 1; i < this.poly_nr; ++i) {
        rad += rad_delta;
        p = gen_point_wrapper(distance, rad, (i % 2 ? radius_small : radius_big));
        cxt.lineTo(p.x, p.y);
      }
    }
    else {
      var radius = gen_progress_value(this.radius, this.radius_to, progress);

      var p = gen_point_wrapper(distance, 0, radius);
      cxt.moveTo(p.x, p.y);
      for (var i = 1; i < this.poly_nr; ++i) {
        rad += rad_delta;
        p = gen_point_wrapper(distance, rad, radius);
        cxt.lineTo(p.x, p.y);
      }
    }

    cxt.fill();

    cxt.restore();
  };

  var Background = function (id) {
    var _this = this;
    _this.id = id;
    _this.target = w.document.getElementById(id);
    if (! _this.target)
      return;
    _this.cxt = _this.target.getContext('2d');
    _this.buffer = w.document.createElement('canvas');
    _this.buffer_cxt = _this.buffer.getContext('2d');
    _this.fan_rad = Math.PI * 2 / config.fan_nr;

    _this.color = "#f00";
    _this.new_color = '';
    _this.change_color_start = 0;

    _this.buffer_cxt.save();

    $(w).on('resize', function () {
      _this.buffer_cxt.restore();
      _this.width = $(w).width();
      _this.height = $(w).height();
      _this.buffer.width = _this.target.width = _this.width;
      _this.buffer.height = _this.target.height = _this.height;
      _this.buffer_cxt.restore();
      _this.buffer_cxt.translate(_this.buffer.width / 2, _this.buffer.height / 2);
      _this.draw();
    }).trigger('resize');

    w.setInterval(function () {
      _this.draw();
    }, 35);
  };

  Background.prototype.react = function ($target) {
    console.log('react');
    this.change_color($target.data('color'));
  };

  Background.prototype.draw_fan = function (time, color, reserve) {
    var cxt = this.buffer_cxt;

    cxt.save();

    var delta = Math.PI / config.fan_nr;

    cxt.fillStyle = color;
    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.lineTo(5000 * Math.cos(delta), 5000 * Math.sin(delta));
    cxt.lineTo(5000 * Math.cos(- delta), 5000 * Math.sin(- delta));
    cxt.fill();

    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.lineTo(5000 * Math.cos(delta), 5000 * Math.sin(delta));
    cxt.lineTo(5000 * Math.cos(- delta), 5000 * Math.sin(- delta));
    cxt.clip();

    if (this.change_color_start) {
      cxt.fillStyle = this.new_color;
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(5000 * Math.cos(delta), 5000 * Math.sin(delta));
      cxt.lineTo( 5000 * Math.cos((1 - 2 * (time - this.change_color_start) / config.color_duration) * delta), 
                  5000 * Math.sin((1 - 2 * (time - this.change_color_start) / config.color_duration) * delta));
      cxt.fill();

      if (time - this.change_color_start > config.color_duration) {
        this.change_color_start = null;
        this.color = this.new_color;
      }
    }

    this.poly.draw(cxt, time, reserve);
    cxt.restore();
  };

  Background.prototype.draw = function () {
    var now = new Date();
    var rad_delta = Math.PI * 2 / config.fan_nr;
    var cxt = this.buffer_cxt;

    if ((this.poly && (now - this.poly.start > config.total)) || (! this.poly)) {
      this.poly = new Poly();
    }

    cxt.save();
    cxt.rotate((now - start_time) / config.rotate_speed);
    for (var i = 0; i < config.fan_nr; ++i) {
      cxt.rotate(rad_delta);
      this.draw_fan(now, i % 2 ? this.color : this.color, i % 2);
    }
    cxt.restore();

    this.cxt.drawImage(this.buffer, 0, 0);
  };

  Background.prototype.change_color = function (new_color) {
    this.new_color = new_color;
    this.change_color_start = new Date();
  };

  w.Background = Background;

  var start_time = new Date();
})(window, window.jQuery);
