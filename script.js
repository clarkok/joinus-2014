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
    $(this).parents('.input').removeClass('focus');
    if ($(this).attr('type') === 'text' && $(this).val().length > 0)
      $(this).parents('.input').addClass('focus');
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
    $(this).parents('.input-file').find('input[type=file]').trigger('click');
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
  var view_start = new Date();
  var fill_start = new Date();
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
      fill_start = new Date();
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
      set_transform($this, 'rotateY(' + w.Math.tan(deltax / 2000) + 'rad) rotateX(' + (-w.Math.tan(deltay / 2000)) + 'rad)');
    });
  });

  var notifier = new w.Notifier();

  var callback = function () {
    var data;
    if (arguments.length == 3)
      data = arguments[2];
    else
      data = arguments[1].result;
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
      notifier.notice('提交成功', false);
      $('.error').removeClass('error');
    }
  };

  $('form').on('submit', function (e) {
    e.preventDefault();
    w.location.hash = '';
    notifier.notice('正在上传');
    $('#input-fill').val((new Date()) - fill_start);
    $('#input-view').val((new Date()) - view_start);
    $.post('submit.php', $('form').serialize(), callback, 'json');
  });

  $('#list').on('click', '.list-item', function () {
    var text = $(this).text();
    $(this).detach();
  });

  $('input[type=file]').fileupload({
    url : 'upload.php',
    add : function (e, data) {
      if ($('input[name=id]').val().length) {
        if (data.files[0].size > 15 * 1024 * 1024) {
          alert('每个文件最大15M，更大可以传网盘嗷');
        }
        $('#list').append(
          $('<li />').addClass('list-item').text(data.files[0].name)
        );
        data.process().done(function () {
          data.submit();
        });
      }
      else {
        alert('ID first');
        return false;
      }
    },
    done : function () {
    }
  }).bind('fileuploadsubmit', function (e, data) {
    if ($('input[name=id]').val().length) {
      data.formData = {
        id : $('input[name=id]').val()
      };
      return true;
    }
    else {
      alert('ID first');
      return false;
    }
  });

  w.setTimeout(function () {
    $(w).trigger('hashchange');
    $('body, html').css('position', 'relative');
  }, 500)

  var restore = function (data) {
    if (data) {
      if (0 >= $('input[name=name]').val().length)
        $('input[name=name]').val(data.name).blur();
      console.log(data.name);
      if (0 >= $('input[name=id]').val().length)
        $('input[name=id]').val(data.id).blur();
      console.log(name.id);
      if (0 >= $('input[name=email]').val().length)
        $('input[name=email]').val(data.email).blur();
      console.log(data.email);
      if (0 >= $('input[name=long]').val().length)
        $('input[name=long]').val(data.long_num).blur();
      console.log(data.long_num);
      if (0 >= $('input[name=short]').val().length)
        $('input[name=short]').val(data.short_num).blur();
      console.log(data.short_num);
      if (0 >= $('input[name=grade]').val().length)
        $('input[name=grade]').val(data.grade).blur();
      console.log('grade');
      if (0 >= $('input[name=class]').val().length)
        $('input[name=class]').val(data.class).blur();
      console.log('class');
      if (0 >= $('#self-intro').val().length)
        $('#self-intro').val(data.question1).blur();
      console.log('q1');
      if (0 >= $('#question1').val().length)
        $('#question1').val(data.question2).blur();
      console.log('q2');
      if (0 >= $('#question2').val().length)
        $('#question2').val(data.question3).blur();
      console.log('q3');
      var $parent;
      if (0 == $('input[name=gender]').val() && (data.gender)) {
        $('input[name=gender]').val(data.gender);
        $parent = $('input[name=gender]').parents('.input');
        $parent.find('.checked').removeClass('checked');
        $parent.find('[data-value=' + parseInt(data.gender) + ']').addClass('checked');
      }
      if (0 == $('input[name=first-chose]').val() && (data.first_chose)) {
        $('input[name=first-chose]').val(data.first_chose);
        $parent = $('input[name=first-chose]').parents('.input');
        $parent.find('.checked').removeClass('checked');
        $parent.find('[data-value=' + parseInt(data.first_chose) + ']').addClass('checked');
      }
      if (0 == $('input[name=second-chose]').val() && (data.second_chose)) {
        $('input[name=second-chose]').val(data.second_chose);
        $parent = $('input[name=second-chose]').parents('.input');
        $parent.find('.checked').removeClass('checked');
        $parent.find('[data-value=' + parseInt(data.second_chose) + ']').addClass('checked');
      }
    }
  };

  var save = function () {
    var res = {
      name : $('input[name=name]').val(),
      gender : $('input[name=gender]').val(),
      long_num : $('input[name=long]').val(),
      short_num : $('input[name=short]').val(),
      email : $('input[name=email]').val(),
      id : $('input[name=id]').val(),
      grade : $('input[name=grade]').val(),
      class : $('input[name=class]').val(),
      first_chose : $('input[name=first-chose]').val(),
      second_chose : $('input[name=second-chose]').val(),
      question1 : $('#self-intro').val(),
      question2 : $('#question1').val(),
      question3 : $('#questino2').val()
    };

    w.localStorage.form_data = JSON.stringify(res);
  };

  var restore_local = function () {
    if (w.localStorage.form_data) {
      var res = JSON.parse(w.localStorage.form_data);
      restore(res);
    }
  };

  restore_local();

  var post_lock = false;

  w.setInterval(function () {
    post_lock = false;
  }, 500);

  $('input[name=name], input[name=email], input[name=id]').on('blur', function () {
    if (post_lock) return;
    post_lock = true;
    $.post('saved.php', {
      name : $('input[name=name]').val(),
      email : $('input[name=email]').val(),
      id : $('input[name=id]').val()
    }, restore, 'json');
  });

  w.setInterval(save, 10000);
})(window, window.jQuery);
