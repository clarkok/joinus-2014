"use strict";

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

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
  var Slider = function ($target, img_list) {
    var _this = this;
    this.target = $target;
    this.img_list = img_list;
    this.r = 0;

    var next = function () {
      var ind = w.Math.floor(w.Math.random() * _this.img_list.length);
      _this.prepare(img_list[ind], function (img) {
        _this.replaceImg(img_list[ind], _this.calcAnimation(img));
        next();
      });
    };

    next();
  };

  Slider.prototype.prepare = function (url, callback) {
    var loaded = false;
    var timeout = false;
    var img = new w.Image();

    this.r = w.setTimeout(function () {
      timeout = true;
      if (loaded)
        callback.call(w, img);
    }, 4000);

    img.onload = function () {
      loaded = true;
      if (timeout)
        callback.call(w, img);
    };
    img.src = url;
  };

  Slider.prototype.calcPosition = function (x, y, img) {
    var ret = {};
    var width = $(w).width();
    var height = $(w).height();
    var min = w.Math.min;
    var max = w.Math.max;
    
    var x_radio = width / (2 * min(x, 1-x) * img.width);
    var y_radio = height / (2 * min(y, 1-y) * img.height);

    var radio = max(x_radio, y_radio);
    ret.width = img.width * radio;
    ret.height = img.height * radio;

    ret.x = - (x * ret.width - width / 2);
    ret.y = - (y * ret.height - height / 2);

    return ret;
  };

  Slider.prototype.calcAnimation = function (img) {
    var ret = {};
    var random = w.Math.random;
    ret.from = this.calcPosition(0.3 + 0.4 * random(), 0.3 + 0.4 * random(), img);
    ret.to = this.calcPosition(0.3 + 0.4 * random(), 0.3 + 0.4 * random(), img);

    return ret;
  };

  Slider.prototype.replaceImg = function (url, animator) {
    var _this = this;
    _this.target.css('opacity', 0);
    w.setTimeout(function () {
      _this.target.addClass('hide');

      _this.target.css({
        backgroundImage: 'url(' + url + ')',
        backgroundSize: (animator.from.width + 'px') + ' ' + (animator.from.height + 'px'),
        backgroundPosition: (animator.from.x + 'px') + ' ' + (animator.from.y + 'px')
      });

      _this.target.removeClass('hide');
      _this.target.css({
        opacity: 1,
        backgroundSize: (animator.to.width + 'px') + ' ' + (animator.to.height + 'px'),
        backgroundPosition: (animator.to.x + 'px') + ' ' + (animator.to.y + 'px')
      });
    }, 500);
  };

  Slider.prototype.stop = function () {
    this.target.css('opacity', 0);
    w.clearTimeout(this.r);
  };

  w.Slider = Slider;
})(window, window.jQuery);

(function (w, $) {
  $('input').on('focus', function () {
    $(this).parents('.input').addClass('focus');
  }).on('blur', function () {
    if ($(this).val().length <= 0)
      $(this).parents('.input').removeClass('focus');
  });
  $('.input.input-text').on('click', function () {
    $(this).find('input[type=text]').trigger('focus');
  });
  $('.input-select').on('click', function () {
    $(this).addClass('focus');
  });
  $('.option').on('click', function (e) {
    if (!$(this).hasClass('checked') || $(this).parents('.input').hasClass('focus')) {
      e.stopPropagation();
      var $input = $(this).parents('.input');
      $input.removeClass('focus').find('.checked').removeClass('checked');
      $(this).addClass('checked');
      $input.find('input').val($(this).data('value'));
    }
  });
})(window, window.jQuery);

(function (w, $) {
  var slider = null;
  $(w).on('hashchange', function () {
    if (slider)
      slider.stop();
    var hash = w.location.hash;
    if (hash == '#joinus') {
      $('body').get(0).className = 'joinus';
    }
    else
    if (hash.length && (hash != '#')) {
      $('body').get(0).className = hash.substring(8);
      slider = new w.Slider($(hash).find('.background-slider'), ['imgs/test1.jpg']);
    }
    else {
      $('body').get(0).className = "ready";
    }
  }).trigger('hashchange');

  if (isCanvasSupported()) {
    var bg = new w.Background('background');
    $('.item').on('mouseenter', function () {
      var x = $(this).offset().left + 50;
      var y = $(this).offset().top + 50;
      var color = $(this).data('color');

      bg.addCircle(new w.Circle(color, x, y, new Date()));
    });
  }

})(window, window.jQuery)
