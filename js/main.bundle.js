;/*!src/static/js/main.js*/


(function (window, $, document, undefined) {
  // 静态方法工具方法
  $.extend({
    beforeZero: function (obj) {
      return obj < 10 ? ('0' + obj) : obj;
    },

    dashJoin: function () {
      var args = [].slice.apply(arguments);
      return args.join(args[3]);
    },

    dateDashJoin: function (year, month, day, join) {
      join = join || '';
      var m = $.beforeZero(month);
      var d = $.beforeZero(day);
      return $.dashJoin(year, m, d, join);
    },
    dateFormat: function (date, fmt) {
      if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      let o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
      }
      for (let k in o) {
          if (new RegExp('('+k+')').test(fmt)) {
              let str = o[k] + ''
              fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length))
          }
      }
      return fmt
  },

    isInIframe: function () {
      return window.frames.length !== parent.frames.length;
    },

    tryJSON: function (str) {
      try {
        var obj = JSON.parse(str);
        return (typeof obj === 'object' && obj) ? obj : str;

      } catch (e) {
        return str;
      }
    },

    getRange: function (input) {
      if (typeof input.selectionStart === 'number' && typeof input.selectionEnd === 'number') {
        return {
          start: input.selectionStart,
          end: input.selectionEnd
        };
      }

      var range = document.selection.createRange();
      var start = 0;
      var end = 0;

      if (range && range.parentElement() === input) {
        var len = input.value.length;
        var normalizeValue = input.value.replace(/\r\n/g, '\n');

        var textInputRange = input.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        var endRange = input.createTextRange();
        endRange.collapse(false);

        if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
          start = end = len;
        } else {
          start = -textInputRange.moveStart('character', -len);
          start += normalizeValue.slice(0, start).split('\n').length - 1;

          if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
            end = len;
          } else {
            end = -textInputRange.moveEnd('character', -len);
            end += normalizeValue.slice(0, end).split('\n').length - 1;
          }
        }
      }

      return {
        start: start,
        end: end
      };
    },

    setRange: function (input, start, end) {
      end = end || start;

      if (input.setSelectionRange) {
        input.setSelectionRange(start, end);
        input.focus();

      } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse();
        range.moveStart('character', start);
        range.moveEnd('character', end - start);
        range.select();
      }
    },

    /**
     * IE9, 需要保存 range
     */
    updateRange: function (input, attr) {
      attr = attr || 'data-range';
      var range = $.getRange(input);
      input.setAttribute(attr, range.start);
      return range;
    },
    layerInterface: function (conf) {
      var params = {
        anim: 0, // 动画
        move: false, // 禁止移动
        shade: 0.15, // 遮罩层透明掉
        shadeClose: true, // 点击遮罩层关闭弹框
      };
  
      return layer.open( $.extend(params, conf || {}) );
    },
     //显示原始图片弹框
  showOriginalImg: function(width,height,src,endCallback) {
    return $.layerInterface({
      title: false,
      type: 1,
      skin: 'original-image',
      area: [width+'px',height+'px'],
      shade: 0.3,
      end: endCallback,
      content: '<div class="image-container">\
        <img src="'+src+'">\
      </div>'
    });
  },

  //点击显示原图
  showOriginalImage: function(parent,child) {
    var flag = true;
    if(flag) {
      $(parent).on('click', child, function(){
        flag = false;
        var image = new Image();
        var path = $(this).css("backgroundImage");
        var src = $(this).data('photo') ? $(this).data('photo') :
          $(this).attr('src') ? $(this).attr('src') : 
            $(this).css("backgroundImage").match(/(http).*?(?=(\?x-oss))/)[0];
        // var src = path.indexOf('?x-oss') > -1 ?
        //           path.match(/(http).*?(?=(\?x-oss))/)[0] :
        //           path.match(/(http).*?(?=")/)[0];
        var index = /\?type=mjsuo/g.test(src) ? src.indexOf('?type=mjsuo') : src.indexOf('?x-oss');
        var _index = /^http/.test(src) ? layer.load() : null;
        $('.layui-layer-shade').on('click',function(){
          _index && layer.close(_index);
        })
        var originalSrc = index > -1 ? src.substring(0,index) : src;
        image.src = originalSrc;
        image.onload=function() {
          var screenH = $(window).height();
          var w = image.width > 1096 ? 1096 : image.width;
          var h = image.width > 1096 ? 'auto' : image.height;
          if((image.width >= 1096 && 1096/image.width >= screenH/image.height) 
              || (image.width<1096 && image.height>screenH)) {
            h = 0.9*screenH;
            w = 0.9*image.width/image.height*screenH;
          }
          _index && layer.close(_index); 
          $.showOriginalImg(w,h,originalSrc,function(){
            flag = true;
          });
        } 
      })
    }
  }
});

  // 原型方法
  jQuery.fn.extend({
    /**
     * @desc 代替锚点，如果不支持就使用锚点
     */
    scrollIntoView: function (view) {
      var view = (view === undefined) ? true : view;
      var elem = this[0];
      'scrollIntoView' in elem ? elem.scrollIntoView(view) : window.location.hash = this.attr('id');
      return this;
    },

    /**
     * @desc 多行文本省略号
     */
    multiTextEllipsis: function (config) {
      function __ellipsis($elem, options) {
        $elem.next('a').hide();

        if ($elem.data('drop')) {
          var $text = $elem.text();

          $elem.next('a').on('click', function () {
            $elem.text($text);
            var _this = $(this);
            var target = _this.data('target') ? $(_this.data('target')) : $elem.parent();
            target.css({
              'height': 'auto'
            });
            _this.hide();
            return false;
          });
        }

        var max = options.maxWidth || $elem.data('zip-width') || $elem.width(),
          ellipsis_char = options.ellipsisChar || $elem.data('zip-char') || '......',
          maxLine = options.maxLine || $elem.data('zip-row') || 2;

        max = max * (+maxLine);

        var text = $elem.text().trim().replace(' ', '　'); //for fix white-space bug

        var $char = $('<span>' + ellipsis_char + '</span>').appendTo(document.body);
        var $temp_elem = $elem.clone(false)
          .css({
            "position": "absolute",
            "visibility": "hidden",
            "whiteSpace": "nowrap",
            "width": "auto",
            "display": "inline",
            "opacity": 0

          }).appendTo(document.body);

        var char_width = $char.width() / 2;
        var width = $temp_elem.width();

        if (width > max) {
          var stop = Math.floor(text.length * max / width); // 极限停止
          var temp_str = text.substring(0, stop) + ellipsis_char;
          width = $temp_elem.text(temp_str).width();

          if (width > max) {
            while (width > max && stop > 1) {
              stop--;
              temp_str = text.substring(0, stop) + ellipsis_char;
              width = $temp_elem.text(temp_str).width();
            }

          } else if (width < max) {
            while (width < max && stop < text.length) {
              stop++;
              temp_str = text.substring(0, stop) + ellipsis_char;
              width = $temp_elem.text(temp_str).width();
            }

            if (width > max) {
              temp_str = text.substring(0, stop - 1) + ellipsis_char;
            }
          }

          $elem.text(temp_str.replace('　', ' '));
          $elem.next('a').show();
        } else {
          $elem.next('a').hide();
        }

        $char.remove();
        $temp_elem.remove();
      }

      return this.each(function () {
        var $this = $(this);
        __ellipsis($this, config || {});
      });
    },

    //代替title属性
    myTitle:function(){
      var currentIndex=0;
      $(this).on('mouseenter',function () {
    var width = $(this).outerWidth(),
        fixedWidth=parseInt( $(this).css('width') );
    var maxWidth = parseInt( $(this).css('max-width') )||fixedWidth;
    
    if (width >= maxWidth) {
      layer.tips($(this).text(), this, {
          tips: [3,'#fff'],
          skin:'tips-menu',
          area: [maxWidth+'px','auto'],
          time: 0,
          success:function(layero,index){
            currentIndex=index;
          }
        })
    }
  }).on('mouseleave', function(event) {
    layer.close(currentIndex);
  });
    },

    /**
     *
     * @desc 监控输入框字段长度变化
     * @param {jQuery DOM} totalViewDom
     * @param {jQuery DOM} selfFieldChangeDom
     * @param {Number || maxlength} total
     */
    // monitFieldChange: function (totalViewDom, selfFieldChangeDom, total) {
    //   var obj = {};

    //   Object.defineProperty(obj, 'field', {
    //     set: function (v) {
    //       totalViewDom.text(v);
    //     }
    //   });

    //   obj.field = this[0].value.length;

    //   if (!this.attr('maxlength') && !total) {
    //     throw new Error(this.selector + ' 没有maxlength特性 或 没有第三个参数total（Number）');
    //   }

    //   this.on('focus input propertyChange', function (ev) {
    //     var number = Number($(this).attr('maxlength')) || total,
    //       len = ev.target.value.length;

    //     if (number - len >= 0) {
    //       obj.field = len;
    //       selfFieldChangeDom && selfFieldChangeDom.text(len);
    //     }
    //   });
    // },
    monitFieldChange: function (totalViewDom, selfFieldChangeDom, total) {
      var obj = {},self = this;
      Object.defineProperty(obj, 'field', {
        set: function (v) {
          // v = v > self.attr('maxlength') ? self.attr('maxlength') : v;
          totalViewDom.text(v);
        }
      });
      
      obj.field = this[0].value.length;
  
      if (!this.attr('maxlength') && !total) {
        throw new Error(this.selector + ' 没有maxlength特性 或 没有第三个参数total（Number）');
      }
      
      this.on('focus input propertyChange', function (ev) {
        var number = Number( $(this).attr('maxlength') ) || total,
            len = ev.target.value.length;
  
        if (number - len >= 0) {
          obj.field = len;
          selfFieldChangeDom && selfFieldChangeDom.text(len);
        }
        if(this.scrollHeight>this.clientHeight) {
          this.scrollTop = this.scrollHeight
        }
      });
    },

    setPlaceholder: function () {
      var isInputSupported = 'placeholder' in document.createElement('input');
      var textareaSupported = 'placeholder' in document.createElement('textarea');

      if (!isInputSupported) {
        this.filter('input').each(_each);
      }

      if (!textareaSupported) {
        this.filter('textarea').each(_each);
      }

      function _each(index) {
        var $this = $(this);
        var placeholder = $this.attr('placeholder');

        if (placeholder) {
          var isInput = $this.is('input');
          var position = $this.position();
          var borderLeftWidth = parseInt($this.css('border-left-width'));
          var paddingLeft = parseInt($this.css('padding-left'));
          var height = isInput ? ($this.outerHeight() + 'px') : 'auto';
          var $label = $('<label class="label__placeholder--text">' + placeholder + '</label>');

          $label.css({
            left: position.left + borderLeftWidth + paddingLeft,
            top: position.top,
            lineHeight: height,
            height: height
          });

          $this.parent().append($label);

          setTimeout(function () {
            // 防止有动态添加ID操作，需要异步
            var id = $this.attr('id');
            if (!id) {
              id = (isInput ? 'input' : 'textarea') + '__index--' + index;
              $this.attr('id', id);
            }
            $label.attr('for', id);
          }, 100);

          $this.on('blur', function () {
            this.value.length ? $label.css('display', 'none') : $label.css('display', '');
          });
        }
      }
    },

    hoverDir: function (mask, options) {
      var timer = null;
      var options = $.extend({
        speed: 300,
        easing: 'ease',
        hoverDelay: 0,
        inverse: false

      }, options);

      function _getStyle(dir) {
        var fromStyle, toStyle,
          slideFromTop = {
            left: '0px',
            top: '-100%',
            opacity: 0
          },
          slideFromBottom = {
            left: '0px',
            top: '100%',
            opacity: 0
          },
          slideFromLeft = {
            left: '-100%',
            top: '0px',
            opacity: 0
          },
          slideFromRight = {
            left: '100%',
            top: '0px',
            opacity: 0
          },
          slideTop = {
            top: '0px',
            opacity: 1
          },
          slideLeft = {
            left: '0px',
            opacity: 1
          };

        switch (dir) {
          case 0:
            // from top
            fromStyle = !options.inverse ? slideFromTop : slideFromBottom;
            toStyle = slideTop;
            break;
          case 1:
            // from right
            fromStyle = !options.inverse ? slideFromRight : slideFromLeft;
            toStyle = slideLeft;
            break;
          case 2:
            // from bottom
            fromStyle = !options.inverse ? slideFromBottom : slideFromTop;
            toStyle = slideTop;
            break;
          case 3:
            // from left
            fromStyle = !options.inverse ? slideFromLeft : slideFromRight;
            toStyle = slideLeft;
            break;
        };

        return {
          from: fromStyle,
          to: toStyle
        };
      }

      return this.on('mouseenter.hoverDir mouseleave.hoverDir', function (event) {
        var _this = $(this),
          $mask = _this.find(mask),
          dir = _this.mouseDirection(event),
          styles = _getStyle(dir);

        if (event.type === 'mouseenter') {
          $mask.hide().css(styles.from);

          clearTimeout(timer);
          _this.timer = setTimeout(function () {
            $mask.show(0, function () {
              $(this).stop().animate(styles.to, options.speed);
            });

          }, options.hoverDelay);

        } else {
          clearTimeout(timer);
          $mask.stop().animate(styles.from, options.speed);
        }
      });
    },

    hoverShow: function () {
      function _transOpacity(opacity) {
        return $(this).find('.mask-text').stop().animate({
          "opacity": opacity
        })
      }
      return this.hover(function (event) {
        _transOpacity.call(this, 1)
      }, function () {
        _transOpacity.call(this, 0)
      });
    },

    /**
     * 判断鼠标从哪个方向进入和离开容器
     * @param {Event Object} ev
     * @return {Number} 0, 1, 2, 3 分别对应着上，右，下，左
     */
    mouseDirection: function (ev) {
      var w = this.outerWidth(),
        h = this.outerHeight(),
        offset = this.offset(),
        x = (ev.pageX - offset.left - (w / 2)) * (w > h ? (h / w) : 1),
        y = (ev.pageY - offset.top - (h / 2)) * (h > w ? (w / h) : 1);

      return Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
    },

    /**
     * @desc 倒计时
     * @param {Number} second 默认60
     */
    countDownTimer: (function () {
      var cDTimer = null;
      var html = undefined;

      return function __CDT(second) {
        cDTimer && clearTimeout(cDTimer);

        var self = this;
        var s = (second === undefined) ? 60 : second;

        if (html === undefined) {
          html = self.html();
        }

        if (s === 0) {
          return self.prop('disabled', false).html(html);

        } else {
          self.prop('disabled', true).html(s + '秒后重试');
          s--;
        }

        cDTimer = setTimeout(function () {
          __CDT.call(self, s);
        }, 1000);
      };
    }()),

    // 分页
    pageNav: function (pageInfo) {
      if (pageInfo != null && pageInfo.total > 0) {
        var html = '';
        //当前页
        var current = pageInfo.current;
        // 总页数
        var pages = pageInfo.pages;

        var orderBy = pageInfo.orderBy;
        // 如果不只有一页
        if (pages > 1) {
          if (current > 1) {
            var before = current - 1;
            //首页
            html += '<a class="item first" href="javascript:;" onclick="page.loadData(1, ' + orderBy + ')" title="首页"> << </a>';
            //上一页
            html += '<a class="item prev" href="javascript:;" onclick="page.loadData(' + before + ', ' + orderBy + ')" title="上一页"> < </a>';
          }
          //判断当前页的前页能不能往前查4页，除去自身应该是减五
          var beforeNum = current - 5 > 0 ? 5 : current;
          //判断当前页能不能往后数3页
          var endNum = current + 3 <= pages ? 3 : pages - current;

          var bef = 5 - beforeNum;
          var end = 3 - endNum;
          if (pages >= 8) {
            beforeNum = (current - 5 + end) > 0 ? (5 + end) : current;
          } else {
            beforeNum = current;
          }
          endNum = (current + 3 + bef) <= pages ? (3 + bef) : pages - current;

          //循环展示当前的前四页
          //计算出当前页往前数有几页超过四个就展示前四个，不超过就有几个展示几个
          for (var i = beforeNum - 1; i > 0; i--) {
            html += '<a class="item" href="javascript:;" onclick="page.loadData(' + (current - i) + ', ' + orderBy + ')">' + (current - i) + '</a>';
          }
          //当前页
          html += '<em class="item active">' + current + '</em>';
          //当前页往后数3页
          for (var i = 1; i <= endNum; i++) {
            html += '<a class="item" href="javascript:;" onclick="page.loadData(' + (current + i) + ', ' + orderBy + ')">' + (current + i) + '</a>';
          }
          if (pages > current) {
            var rear = current + 1;
            //下一页
            html += '<a class="item next" href="javascript:;" onclick="page.loadData(' + rear + ', ' + orderBy + ')" title="下一页"> > </a>';
            // 末页
            html += '<a class="item last" href="javascript:;" onclick="page.loadData(' + pages + ', ' + orderBy + ')" title="尾页"> >> </a>';
          }
        } else {
          html += '<em class="item active">1</em>';
        }
        this.html(html);
      }
    },
     // 自动提示邮箱后缀
  changeTips :function(value){
    value = $.extend({
      divTip:""
    },value)
    
    var $this = $(this);
    var indexLi = 0;
    var strHtml='<ul class="'+value.divTip.replace('.','')+'">\
                    <li data-email="@qq.com"></li>\
                    <li data-email="@163.com"></li>\
                    <li data-email="@123.com"></li>\
                    <li data-email="@sina.com"></li>\
                    <li data-email="@139.com"></li>\
                    <li data-email="@126.com"></li>\
                    <li data-email="@yahoo.com"></li>\
                    <li data-email="@gmail.com"></li>\
                </ul>';
    $this.parents('.ui-input').append(strHtml)
    //点击document隐藏下拉层
    $('body').on('click','#Mask',function(event){
      blus();
      $(this).remove();
    })
    $(value.divTip).on('mousedown','li',function(event){
      if(event.button!==0){
        return false
      }
      var liVal = $(event.target).text();
      value.invalid ? $this.val(liVal) : $this.val(liVal).valid();
      blus();
    })
    
    //隐藏下拉层
    function blus(){
      $(value.divTip).hide();
      $('#Mask').remove();
    }
    
    //键盘上下执行的函数
    function keychang(up){
      if(up == "up"){
        if(indexLi == 0){
          indexLi = $(value.divTip).find('li:not(:hidden)').length-1;
        }else{
          indexLi--;
        }
        
      }else{
        if(indexLi ==  $(value.divTip).find('li:not(:hidden)').length-1){
          indexLi = 0;
        }else{
          indexLi++;
        }
      }
      $(value.divTip).find('li:not(:hidden)').eq(indexLi).addClass("active").siblings().removeClass();
      var liVal = $(value.divTip).find('li:not(:hidden)').eq(indexLi).text();
      $this.val(liVal);
    }
    
    //值发生改变时
    function valChange(){
      var tex = $this.val();//输入框的值
      var fronts = "";//存放含有“@”之前的字符串
      var af = /@/;

      if(tex.charAt(0) == "@") {
        $this.val('');
        tex = '';
      }

      // var regMail = new RegExp(tex.substring(tex.indexOf("@")));//有“@”之后的字符串
     
      tex = tex.replace(/[\u4e00-\u9fa5]/g, '');

      //让提示层显示，并对里面的LI遍历
      if(tex==""){
        blus();
      }else{
        if(!$('#Mask').length) {
          $('body').prepend('<div id="Mask" style="position: absolute;left: 0;top: 0;z-index: 9;width: 100%;height: 100%;background: transparent;"></div>');
        }
        $(value.divTip).
        show().
        children().
        each(function(index) {
          var valAttr = $(this).data("email");
          if(index==0){$(this).addClass("active").siblings().removeClass();}
          //索引值大于1的LI元素进处处理
          // if(index>1){
            //当输入的值有“@”的时候
            if(af.test(tex)){
              var regMail = new RegExp(tex.substring(tex.indexOf("@")));//有“@”之后的字符串
              //如果含有“@”就截取输入框这个符号之前的字符串
              fronts = tex.substring(tex.indexOf("@"),0);
              $(this).text(fronts+valAttr);
              // 判断输入的值“@”之后的值，是否含有LI的email属性
              // if(!!regMail && regMail.test($(this).data("email"))){
              if(!!regMail && regMail.test($(this).data("email"))){
                $(this).show();

                // console.log($(value.divTip).find('li:not(:hidden)').length)
              }else{
                  $(this).hide();
              }
              //判断输入的值“@”之后的值，是否含有和LI的email属性
              // if(regMail.test($(this).data("email"))){
              //   $(this).show();
              // }else{
              //   if(index>1){
              //     $(this).hide();
              //   }	
              // }
              indexLi = 0;
              $(value.divTip).find('li:not(:hidden)').eq(indexLi).addClass("active").siblings().removeClass();
            }
            //当输入的值没有“@”的时候
            else{
              $(this).text(tex+valAttr).show();
            }
            if($(value.divTip).find('li:not(:hidden)').length===0) {
              $(value.divTip).hide();
            }
          // }
        })
      }	
    }

    $(this).bind("input",function(){
      valChange();
    })
    
    //鼠标点击和悬停LI
    $(value.divTip).children().
    hover(function(){
      indexLi = $(this).index();//获取当前鼠标悬停时的LI索引值;
      $(this).addClass("active").siblings().removeClass();
    })

    //按键盘的上下移动LI的背a景色
    $this.keydown(function(event){
      if(event.which == 38){//向上
        keychang("up")
      }else if(event.which == 40){//向下
        keychang()
      }else if(event.which == 13){ //回车
        var liVal = $(value.divTip).find('li:not(:hidden)').eq(indexLi).text();
        value.invalid ? $this.val(liVal) : $this.val(liVal).valid();
        blus();
      }
    })				
  }
  });

  /**
   *
   * @desc $ 序列化字符串，日期格式化
   * @example $.serialize().serializeDateFormat();
   * @returns {String} $ 序列化后的字符串，日期格式化
   */
  window.String.prototype['serializeDateFormat'] = function () {
    var str = this;
    var reg = /year=(\d{4})&month=(\d{1,2})&day=(\d{1,2})/i;
    var matchAry = str.match(reg);
    return str.replace(reg, 'date=' + $.dateDashJoin(matchAry[1], matchAry[2], matchAry[3], '-'));
  };

}(window, $, document));
;

// Placeholder 兼容
$('input,textarea').setPlaceholder();

// __inline('/src/static/js/modules/my_layer.js');
// __inline('/src/static/js/modules/form.js');

(function ($, window, document, undefined) {

$('#mini').hover(function(){
  let $img = $('#mini-code img')
  $img.attr('src', $img.attr('data-src'))
  console.log($('#mini-code').html())
  layer.tips(`${$('#mini-code').html()}`, this,{
    tips: [1, '#FFF'],
    time:0
  });
},function(){
  layer.closeAll()
})
$('#downApp').hover(function(){
    layer.tips(`${$('#app-code').html()}`, this,{
        tips: [1, '#FFF'],
        time:0
    });
},function(){
    layer.closeAll()
})
$('#wexin').hover(function(){
    layer.tips(`${$('#weixin-code').html()}`, this,{
        tips: [1, '#FFF'],
        time:0
    });
},function(){
    layer.closeAll()
})
}(jQuery, window, document));


