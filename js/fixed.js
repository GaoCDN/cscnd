function buffer(a, b, c) {
	var d;
	return function() {
		if (d) return;
		d = setTimeout(function() {
			a.call(this), d = undefined
		}, b)
	}
}(function() {
	function e() {
		var d = document.body.scrollTop || document.documentElement.scrollTop;
		d > b ? (a.className = "box nwidget fixed", c && (a.style.top = d - b + "px")) : a.className = "box nwidget"
	}
	var a = document.getElementById("float");
	if (a == undefined) return !1;
	var b = 0,
		c, d = a;
	while (d) b += d.offsetTop, d = d.offsetParent;
	c = window.ActiveXObject && !window.XMLHttpRequest;
	if (!c || !0) window.onscroll = buffer(e, 150, this)
})();

// 详情页模态框
$(".new .new_l .new_l_txt .jiaqu a").click(function() {
	$(".modal-content").addClass("on");
});
$(".modal-hide").click(function() {
	$(".modal-content").removeClass("on");
});

//详情页列表
$(function() {
	var col = 8; //默认显示8行
	var num = $(".list_con li").size();
	if (num > col) {
		$(".list_more").addClass("on");
		$(".list_con li").each(function(i) {
			if (i >= col) {
				$(this).hide();
			}
		});
	}
	$(".list_more").click(function() {
		col = col + 11;
		if (col >= num) {
			$(".list_more").html("<span class='on'>已全部加载完<span>");
		}
		$(".list_con li").each(function(i) {
			if (i <= col) {
				$(this).show();
			}
		});
	});


})


$(function() {
	// tab切换
	function tabs(tabTit, on, tabCon) {
		$(tabTit).mousemove(function() {
			$(this).addClass(on).siblings().removeClass(on);
			var index = $(tabTit).index(this);
			$(tabCon).eq(index).show().siblings().hide();
		});
	};
	tabs(".link_tit span", "on", ".link_tab .link_con");
	tabs(".zsb_type_tab_tit span", "on", ".zsb_type_tab_con .zsb_type_con");
	tabs(".m_index_list_nav>span", "on", ".m_index_list_con>ul");
	tabs(".c1_box2_bot>.tit_tab>a", "on", ".c1_box2_tab_con>ul");
	tabs(".yx_video_tab>span", "on", ".yx_video_con>.yx_video_con_con");
	tabs(".gaokao_bread02>a", "on", ".gaokao_list>.lbcontent");
	tabs(".new_tag_t_tab_tit>span", "on", ".new_tag_t_tab_con>ul");
});


// 首页轮播图控制
function swipers2(tab, con, on, none) {
	var mySwiper_tit = new Swiper(tab, {
		slidesPerView: 'auto',
		autoplay: 3000,
		observer: true,
		observeParents: true,
		onobserverUpdate: function() {
			mySwiper_tit.update();
		},
	})
	// 内容
	var mySwiper_con = new Swiper(con, {
		paginationClickable: true,
		autoplay: 3000,
		spaceBetween: 20,
		observer: true,
		observeParents: true,
		onobserverUpdate: function() {
			mySwiper_con.update();
		},
		// speed: 500,
		onTransitionStart: function() {
			$(on).removeClass('on');
			$(none).eq(mySwiper_con.activeIndex).addClass('on');
		}

	})
	$(none).on('click', function(e) {
		e.preventDefault();
		$(on).removeClass('on');
		$(this).addClass('on');
		mySwiper_con.slideTo($(this).index(), 300, false);
	})
}
swipers2(".m_list_swiper_tab1", ".m_list_swiper_con1", ".m_list_swiper_tab1 .swiper-slide.on",
	".m_list_swiper_tab1 .swiper-slide");
swipers2(".m_swiper_yxzy_tabs", ".m_swiper_yxzy_cons", ".m_swiper_yxzy_tabs .swiper-slide.on",
	".m_swiper_yxzy_tabs .swiper-slide");




var m_mySwiper = new Swiper('.m_c1_banner', {
	autoplay: 3000, //可选选项，自动滑动
	pagination: '.swiper-pagination',
	paginationClickable: true,
})


var m_mySwiper1 = new Swiper('.m_swper_wx', {
	autoplay: 2000, //可选选项，自动滑动
	loop: true,
	effect: 'flip',
})





// 头部导航
$(function() {
	$(".m_menu").click(function() {
		$(".m_head_nav").toggleClass("on");
		$("body").css("overflow", "hidden");
	});
	$("#m_back").click(function() {
		$(".m_head_nav").toggleClass("on");
		$("body").css("overflow", "initial");
	});
});


// 首页列表切换
$(".m_index_list_nav>i").click(function() {
	$(this).toggleClass("on");
	$(".m_index_list_nav_none").toggleClass("on");
});
$(".m_index_list_nav>span").click(function() {
	$(".m_index_list_nav_none>span").removeClass("on");
});
$(".m_index_list_nav_none>span").click(function() {
	$(this).addClass("on").siblings().removeClass("on");
	$(".m_index_list_nav>span").removeClass("on");
	let index = $(this).index() + 3;
	$(".m_index_list_con>ul").eq(index).show().siblings().hide();
});

// 展开全文
$(function() {
	$("#m_zkqw_open>.m_zkqw_open_btn").click(function() {
		$("#con").css("height", "auto");
		$("#m_zkqw_open").hide();
	});
});

