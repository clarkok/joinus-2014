"use strict";

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

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
  }).trigger('focus').trigger('blur');
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
  $('.input-file').on('click', '.button', function () {
    $(this).parent().find('input[type=file]').trigger('click');
  });
  $('.input-submit').on('click', '.button', function () {
    $(this).parents('form').trigger('submit');
  });
})(window, window.jQuery);

(function (w, $) {
  var Notifier = function () {
    this.target = $('#notice');
    this.context = $('#notice-context');
    this.r = 0;
  };

  Notifier.prototype.notice = function (context, error) {
    this.context.html(context);
    this.target.addClass('show');
    w.clearTimeout(this.r);
    if (error)
      this.context.addClass('error');
    else
      this.context.removeClass('error');
    var _this = this;

    this.r = w.setTimeout(function () {
      _this.target.removeClass('show');
    }, 5000);
  };

  Notifier.prototype.clear = function () {
    w.clearTimeout(this.r);
    this.target.removeClass('show');
  };

  w.Notifier = Notifier;
})(window, window.jQuery);

(function (w, $) {
  var slider = null;
  var set_transform = function ($target, arg) {
    return $target.css({
      '-webkit-transform' : arg,
      '-moz-transform' : arg,
      '-mz-transform' : arg,
      'transform' : arg
    });
  };

  $(w).on('hashchange', function () {
    if (slider)
      slider.stop();
    set_transform($('.item'), '');
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
  });

  if (isCanvasSupported()) {
    var bg = new w.Background('background');
    $('.item').on('mouseenter', function () {
      bg.react($(this));
    });
  }

  $(w.document).on('mousemove', 'body.ready', function (e) {
    var x = e.clientX - $(w).width() / 2;
    var y = e.clientY - $(w).height() / 2;
    $('.item').each(function () {
      var $this = $(this);
      var deltax = x - parseFloat($this.css('left'));
      var deltay = y - parseFloat($this.css('top'));
      set_transform($this, 'rotateY(' + w.Math.tan(deltax / 1000) + 'rad) rotateX(' + (-w.Math.tan(deltay / 1000)) + 'rad)');
    });
  });

  var form_data = null;
  var file_list = [];

  var notifier = new w.Notifier();

  var callback = function (data) {
    console.log(data);
    if (data.code == 1)
      notifier.notice('提交失败，请稍后重试', true);
    else if (data.code == 2) {
      notifier.notice('表单中有错误，<a href="#joinus">点击查看</a>', true);
      var l = data.error_list.length;
      for (var i = 0; i < l; ++i) {
        $('#input-' + data.error_list[i]).addClass('error');
      }
    }
    else if (data.code == -1) {
      w.location.hash = '#detail-tech';
      notifier.notice('年轻人有前途，快加入技术研发中心吧', false);
    }
    else {
      console.log('else');
      notifier.notice('提交成功', false);
      $('.error').removeClass('error');
    }
  };

  $('form').on('submit', function (e) {
    e.preventDefault();
    w.location.hash = '';
    notifier.notice('正在上传');
    if (form_data)
      $('input[type=file]').fileupload('send', form_data);
    else
      $.post('submit.php', $('form').serialize(), callback, 'json');
  });

  $('input[type=file]').fileupload({
    dataType : 'json',
    formData : function (form) {
      return form.serializeArray();
    },
    add : function (e, data) {
      form_data = data;
      file_list = file_list.concat(data.files);
      form_data.files = file_list;
    },
    autoUpload : false
  });

  w.setTimeout(function () {
    $(w).trigger('hashchange');
    $('body, html').css('position', 'relative');
  }, 500)
})(window, window.jQuery)
