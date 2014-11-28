//1212 封神榜会场
//

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

var FengShen = function () {
	this.debug = /debug=true/i.test(location.href);

	this.dataurl = this.debug ? [
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata0.js',
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata1.js',
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata2.js',
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata3.js',
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata4.js',
		'http://g.assets.daily.taobao.net/mtb/app-1111-daren/0.0.7/js/tmsdata5.js'
	] : [
		'http://www.taobao.com/go/rgn/app/c1412-remaiout0.php',
		'http://www.taobao.com/go/rgn/app/c1412-remaiout1.php',
		'http://www.taobao.com/go/rgn/app/c1412-remaiout2.php',
		'http://www.taobao.com/go/rgn/app/c1412-remaiout3.php',
		'http://www.taobao.com/go/rgn/app/c1412-remaiout4.php',
		'http://www.taobao.com/go/rgn/app/c1412-remaiout5.php'
	];

	this.data = {};

	this.bind();

	this.showByHash();
};
FengShen.prototype = {
	initPageScroll: function () {
		if (!this.pageScroller) {
			this.pageScroller = new lib.scroll({
				scrollElement: $('.scroll-con')[0]
			}).init();

			this.pageScroller.enablePlugin('refresh', {
			    element: '<div class="pull-down">下拉刷新</div>', //可以是HTML片段也可以是HTML元素
			    height: 80, // 元素的高度，默认为0
			    offset: parseInt($('.scroll-con').css('padding-top')),  // 元素距离顶部的偏移，默认为0，可为负数
			    onrefresh: function(done) {
			        // 上下文是当前的scroller对象
			        // 触发刷新动作时的回调
			        // 自行做刷新的渲染
			        // 完成后运行done方法
			        location.reload();
			        done();
			    }
			});	

			this.pageScroller.enablePlugin('lazyload', {
			    realTimeLoad: false // 是否在滚动时进行懒加载，默认为false
			});
		}
		this.pageScroller.refresh();
	},
	initMainTabScroll: function () {
		if (!this.mainTabScroller) {
			this.mainTabScroller = new lib.scroll({
				scrollElement: $('.main-tab ul')[0],
				direction: 'x'
			}).init();
		}
		this.mainTabScroller.refresh();
	},
	bind: function () {
		var me = this;
		$('body').on('click', '.main-tab a', function (e) {
			e.preventDefault();

			var $li = $(this).parents('li');
			if (!$li.hasClass('active')) {
				var mainId = $li.index();
				var subId = 0;
				me.navTo(mainId+1, subId+1);
			}
		}).on('click', '.sub-tab a', function (e) {
			e.preventDefault();
			var $li = $(this).parents('li');
			if (!$li.hasClass('active')) {
				var ind = $li.index();
				$(this).parents('.main-con').find('.sub-tab li').removeClass('active');
				$li.addClass('active');
				$(this).parents('.main-con').find('.main-list').hide().eq(ind).show();
				me.pageScroller && me.pageScroller.refresh();

				me.navTo($('.main-tab li.active').index() + 1, $li.index() + 1);
			}
		}).on('click', '.gocart-btn', function (e) {
			e.preventDefault();
			var id = $(this).parents('li').attr('data-id');
			me.addToCart(id);
		});

		//route
		$(window).on('hashchange', function () {
			me.showByHash();
		});
	},
	navTo: function (mainId, subId) {
		var hash = '#' + mainId + '/' + subId;
		location.hash = hash;
	},
	addToCart: function (id) {
		var me = this;
		//mtop  mtop.trade.addBag v3.0
		if (!lib.login.isLogin()) {
			lib.login.goLogin();
			return false;
		}

		lib.mtop.request({
			"api" : "mtop.trade.addBag",
			"v" : "3.0",
			"data" : 
			{
				"itemId" : id,
				"quantity" : "1"
			}
		},function(res){
			console.log(res);
			if (/success/i.test(res.ret)) {
				me.showTip('加入购物车成功', 1500);
			}
		},
		function(failObj){
			console.warn(failObj);
			me.showTip('加入购物车失败', 1500);
		});

	},
	showTip: function (msg, time) {
		var $tip = $('.global-tip');
		if (!$tip[0]) {
		 	$tip = $('<div class="global-tip"></div>').appendTo('body');
		}
		$tip.html(msg).show();
		$tip.css({
			left: (window.innerWidth - $tip.width())/2,
			top: (window.innerHeight - $tip.height())/2
		});

		if (time) {
			clearTimeout(this._tiptimer);
			this._tiptimer = setTimeout(function () {
				$tip.hide();
			}, time);
		}
	},

	showByHash: function () { console.log(location.hash)
		var hash = location.hash.replace(/^#/, '');
		var arr = hash.split('/');
		var mainId = 1;
		var subId = 1;

		if (parseInt(arr[0])) {
			mainId = Math.max(1, Math.min(6, parseInt(arr[0])));
		} else {
			//没有指定mainId, 那么按照时间判断 ，6号第一个tab，以此类推，11号第6个tab
			var st = parseInt(window.SERVERMILLISECOND) || (+new Date);
			var date = new Date(st).getDate();
			var month = new Date(st).getMonth();

			if (month === 11) {
				mainId = Math.min(6, Math.max(1, date-5));
			}
		}
		if (parseInt(arr[1])) {
			subId = Math.max(1, parseInt(arr[1]));
		}

		mainId --;
		subId --;

		this.show(mainId, subId);
	},
	show: function (mainId, subId) {
		console.log(mainId, subId);
		var me = this;
		var $tabLi = $('.main-tab li');

		$('.main-tab-con').hide();
		$tabLi.removeClass('active');

		var $conWrap = $('.main-tab-con').eq(mainId);
		if ($conWrap.hasClass('rendered')) {
			$conWrap.show();
			$tabLi.eq(mainId).addClass('active');

			$conWrap.find('.main-list').hide().eq(subId).show();
			$conWrap.find('.sub-tab li').removeClass('active').eq(subId).addClass('active');

			me.pageScroller && me.pageScroller.refresh();
			me.pageScroller && me.pageScroller.checkLazyload();

			me.updateMainTabPos();
		} else {
			this.requestData(mainId, function (mainId, subId, $el) {
				return function (data) {
					me.data[mainId] = data;
					me.render(mainId, subId);
					$el.addClass('rendered').show();
					$('.main-tab li').eq(mainId).addClass('active');
					$('.main-tab-con').eq(mainId).find('.main-list').hide().eq(subId).show();
					me.pageScroller && me.pageScroller.refresh();
					me.pageScroller && me.pageScroller.checkLazyload();

					me.updateMainTabPos();
				}
			}(mainId, subId, $conWrap))
		}
	},
	render: function (mainId, subId) {
		var data = this.data[mainId];

		data.tabs.forEach(function (tab) {
			tab.items.forEach(function (o) {
				o.soldClass = '';
				o.soldText = '';
				if (!!parseInt(o.count)) {
					if (parseInt(o.count) < 10) {
						o.soldClass = 'visible';
						o.soldText = '库存紧张';
					}
				} else if (parseInt(o.count) === 0) {
					o.soldClass = 'visible';
					o.soldText = '已售罄';
				}	
			});
		});
		

		var $conWrap = $('.main-tab-con').eq(mainId);

		if (!$('.main-tab').hasClass('rendered')) {
			this.renderMainTab(data);
		}

		var html = tmpl('main_tab_con_tmpl', data);
		$conWrap.html(html).addClass('rendered');

		$conWrap.find('.sub-tab li').removeClass('active').eq(subId).addClass('active');

		if (!this.pageScroller) {
			this.initPageScroll();
		}
	},
	renderMainTab: function (data) {
		var html = tmpl('main_tab_tmpl', data);
		$('.tab-scroll-wrap').html(html);
		$('.main-tab').addClass('rendered');

		this.initMainTabScroll();
	},
	requestData: function (id, cb) {
		var src = this.dataurl[id];
		var script = document.createElement('script');
		script.className = 'data-script';
		script.type = 'text/javascript';
		script.onload = function () {
			cb && cb(window.TMSDATA);
			$('script.data-script').remove();
		};
		script.src = src;
		document.body.appendChild(script);
	},
	updateMainTabPos: function () {
		var $li = $('.main-tab li.active');
		var $wrap = $li.parents('.tab-scroll-wrap');
		var of = $li.position();
		var sl = of.left - ($wrap.width()/2 - $li.width()/2);
		this.mainTabScroller.scrollTo(sl, true);
	}
};

$(function () {
	// write your code!
	console.log("let's start!");
	new FengShen();
});