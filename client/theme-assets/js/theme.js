/**
 *   File Name: theme.js
 *   Description: Theme related common JS.
 *   -------------------------------------------------------------------------------------------
 *   Item Name: Crypto ICO - Cryptocurrency Website Landing Page HTML + Dashboard Template
 *   Version: 1.0
 *   Author: Pixinvent
 *   Author URL: http://www.themeforest.net/user/pixinvent
 **/
'use strict';

var apple_phone = /iPhone/i,
	apple_ipod = /iPod/i,
	apple_tablet = /iPad/i,
	android_phone = /\bAndroid(?:.+)Mobile\b/i, // Match 'Android' AND 'Mobile'
	android_tablet = /Android/i,
	amazon_phone = /\bAndroid(?:.+)SD4930UR\b/i,
	amazon_tablet = /\bAndroid(?:.+)(?:KF[A-Z]{2,4})\b/i,
	windows_phone = /Windows Phone/i,
	windows_tablet = /\bWindows(?:.+)ARM\b/i, // Match 'Windows' AND 'ARM'
	other_blackberry = /BlackBerry/i,
	other_blackberry_10 = /BB10/i,
	other_opera = /Opera Mini/i,
	other_chrome = /\b(CriOS|Chrome)(?:.+)Mobile/i,
	other_firefox = /\Mobile(?:.+)Firefox\b/i; // Match 'Mobile' AND 'Firefox'

function match(regex, userAgent) {
	return regex.test(userAgent);
}


function isMobile(userAgent) {
	var ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

	// Facebook mobile app's integrated browser adds a bunch of strings that match everything. Strip it out if it exists.
	var tmp = ua.split('[FBAN');
	if (typeof tmp[1] !== 'undefined') {
		ua = tmp[0];
	}

	// Twitter mobile app's integrated browser on iPad adds a "Twitter for iPhone" string. Same probably happens on other tablet platforms.
	// This will confuse detection so strip it out if it exists.
	tmp = ua.split('Twitter');
	if (typeof tmp[1] !== 'undefined') {
		ua = tmp[0];
	}

	var result = {
		apple: {	phone:		match(apple_phone, ua) && !match(windows_phone, ua),
					ipod:		match(apple_ipod, ua),
					tablet:		!match(apple_phone, ua) &&
								match(apple_tablet, ua) &&
								!match(windows_phone, ua),
					device:		(match(apple_phone, ua) ||
								match(apple_ipod, ua) ||
								match(apple_tablet, ua)) &&
								!match(windows_phone, ua)
		},
		amazon: {	phone:		match(amazon_phone, ua),
					tablet:		!match(amazon_phone, ua) && match(amazon_tablet, ua),
					device:		match(amazon_phone, ua) || match(amazon_tablet, ua)
		},
		android: {	phone:		(!match(windows_phone, ua) && match(amazon_phone, ua)) ||
								(!match(windows_phone, ua) && match(android_phone, ua)),
					tablet:		!match(windows_phone, ua) &&
								!match(amazon_phone, ua) &&
								!match(android_phone, ua) &&
								(match(amazon_tablet, ua) || match(android_tablet, ua)),
					device:		(!match(windows_phone, ua) &&
								(match(amazon_phone, ua) ||
								match(amazon_tablet, ua) ||
								match(android_phone, ua) ||
								match(android_tablet, ua))) ||
								match(/\bokhttp\b/i, ua)
		},
		windows: {	phone:		match(windows_phone, ua),
					tablet:		match(windows_tablet, ua),
					device:		match(windows_phone, ua) || match(windows_tablet, ua)
		},
		other: {	blackberry:	match(other_blackberry, ua),
					blackberry10: match(other_blackberry_10, ua),
					opera:		match(other_opera, ua),
					firefox:	match(other_firefox, ua),
					chrome:		match(other_chrome, ua),
					device:		match(other_blackberry, ua) ||
								match(other_blackberry_10, ua) ||
								match(other_opera, ua) ||
								match(other_firefox, ua) ||
								match(other_chrome, ua)
		}
	};
	result.any =	result.apple.device ||
					result.android.device ||
					result.windows.device ||
					result.other.device;

	// excludes 'other' devices and ipods, targeting touchscreen phones
	result.phone =	result.apple.phone || result.android.phone || result.windows.phone;
	result.tablet = result.apple.tablet || result.android.tablet || result.windows.tablet;

	return result;
}

function gettime() {
	var tm = new Date().getTime();
	var seconds = (tm / 1000) % 60;
	seconds = seconds.toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
	var miliseconds = ('00' + tm).slice(-3);
	return seconds + ':' + miliseconds;
}


// Preloader
$(window).on('load', function() {
	// console.log('theme-onload-start: ' + gettime());

	setTimeout(function() {
		$('body').addClass('loaded');
	}, 1);

	if (!isMobile().any) {
		if ($('.page-animated').length > 0) {
			InitWaypointAnimations();
		}
	}

	setTimeout(function() {
		$('.cic-logo').addClass('cic-logo-animation');
		$('.svg-elements-1').addClass('svg-elements-1-animation');
		$('.svg-elements-2').addClass('svg-elements-2-animation');
	}, 3000);

	// console.log('theme-onload-end: ' + gettime());
});


(function(window, document, $) {
	var $html = $('html');
	var $body = $('body');

	// Using scrollSpy for the navigation
	$body.scrollspy({target: '#navigation'});
	// Init Navbar slideline function
	navbarSlideLine();
	// Update the slideline position on scroll/click
	$(window).on('activate.bs.scrollspy', function(e) {
		navbarSlideLine();
	});

	// Add shadow and color to fixed top navbar
	$(window).scroll(function() {
		fixedTopNavbar();
	});
	fixedTopNavbar();

	// Navbar absolute position on small screen
	navbarAbsolute();
	// $(window).resize(function() { // Invoke on window resize
	// 	navbarAbsolute();
	// });

	// Menu navbar toggler animation
	$('.main-menu .navbar-toggler').click(function(event) {
		$('.main-menu').toggleClass('open', 1000, 'swing');
	});

	// On menu click, Smooth Scrolling
	$('.main-menu a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				event.preventDefault();
				$('.navbar-collapse').collapse('hide');
				$('html, body').animate({
					scrollTop: target.offset().top
				}, 500, function() {
					var $target = $(target);
					$target.focus();
					if ($target.is(':focus')) { return false; } else {
						$target.attr('tabindex', '-1');
						$target.focus();
					}
				});
			}
		}
	});

	// Video Modal Open / Close

	// Gets the video src from the data-src on video button
	// var $videoSrc;
	// $('.video-btn').click(function() {
	// $videoSrc = $(this).data('src');
	// });
	// when the modal is opened autoplay it
	// $('#ico-modal').on('shown.bs.modal', function(e) {
	// set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
	// $('#video').attr('src', $videoSrc + '"?rel=0&amp;showinfo=0&amp;modestbranding=1&amp;autoplay=1');
	// });
	// stop playing the youtube video when I close the modal
	// $('#ico-modal').on('hide.bs.modal', function(e) {
	// a poor man's stop video
	// $('#video').attr('src', $videoSrc);
	// });

	// Initialize Swiper
	var swiperICO = new Swiper('.swiper-containerICO', {
		slidesPerView: 4,
		grabCursor: true,
		navigation: {
			nextEl: '.next-slideICO',
			prevEl: '.prev-slideICO'
		},
		breakpoints: {
			576: {slidesPerView: 1},
			767: {slidesPerView: 2},
			992: {slidesPerView: 3}
		}
	});
	var swiperSSW = new Swiper('.swiper-containerSSW', {
		slidesPerView: 4,
		grabCursor: true,
		navigation: {
			nextEl: '.next-slideSSW',
			prevEl: '.prev-slideSSW'
		},
		breakpoints: {
			576: {slidesPerView: 1},
			767: {slidesPerView: 2},
			992: {slidesPerView: 3}
		}
	});

	// if ($(window).width() < 992) {
	var roadmapmonths = {'11-2017': 0, '12-2017': 0, '1-2018': 0,
						 '2-2018': 1,
						 '3-2018': 2,
						 '4-2018': 3, '5-2018': 3, '6-2018': 3,
						 '7-2018': 4,
						 '8-2018': 5,
						 '9-2018': 6, '10-2018': 6,
						 '11-2018': 7, '12-2018': 7,
						 '1-2019': 8, '2-2019': 8,
						 '3-2019': 9, '4-2019': 9, '5-2019': 9};
	var now = moment().month() + '-' + moment().year();
	var idx = roadmapmonths[now];
	swiperICO.slideTo(idx, 1000, false);
	// }
	$(window).resize(function() {
	// if ($(window).width() < 992) {
		swiperICO.slideTo(idx, 1000, false);
	// }
	});

	var slidescont = $('.swiper-containerICO');
	var slidewrapp = slidescont.find('.swiper-wrapper');
	var slides = slidewrapp.find('.swiper-slide');
	slides.removeClass('active');
	var slide = slidewrapp.find('.swiper-slide:nth-child(' + (idx + 1) + ')');
	slide.addClass('active');
	slides.each(function(index, element) {
		if (index < idx) {
			$(element).find('timestamp').removeClass('remaining').addClass('completed');
		} else {
			$(element).find('timestamp').addClass('remaining').removeClass('completed');
		}
	});

})(window, document, jQuery);


// Absolute navbar below 992(md) screen

function navbarAbsolute() {
	$('.main-menu').addClass('fixed-top');
	// if (window.matchMedia('(min-width: 992px)').matches) {
	// $('.main-menu').removeClass('fixed-top').addClass('navbar-absolute');
	// $('.main-menu .nav-item, .main-menu .dropdown, .main-menu .btn-sign-in').removeClass('animated');
	// } else {
	// $('.main-menu').addClass('fixed-top').removeClass('navbar-absolute');
	// $('.main-menu .nav-item, .main-menu .dropdown, .main-menu .btn-sign-in').addClass('animated');
	// }
}

function fixedTopNavbar() {
	var scroll = $(window).scrollTop();
	if (scroll >= 50) {
	//	if ($(window).width() > 992) {
		$('.navbar').addClass('navbar-fixed navbar-shadow');
		$('.navbar #slide-line').removeClass('d-none');
		inverseNavbar(true); // For inverse navbar
	//	}
	} else {
		$('.navbar').removeClass('navbar-fixed navbar-shadow');
		$('.navbar #slide-line').addClass('d-none');
		inverseNavbar(false);
	}
}

function inverseNavbar(isFixed) {
	if ($('body').hasClass('template-intro-video')) {
		if (isFixed) {
			$('.navbar-brand-logo-dark').removeClass('d-none');
			$('.navbar-brand-logo').addClass('d-none');
			$('.btn-sign-in').removeClass('btn-light').addClass('btn-gradient-blue');
		} else {
			$('.navbar-brand-logo-dark').addClass('d-none');
			$('.navbar-brand-logo').removeClass('d-none');
			$('.btn-sign-in').addClass('btn-light').removeClass('btn-gradient-blue');
		}
	}
}

// Set the slideline width for active menu

function navbarSlideLine() {
	var $nav = $('#navigation');
	var $slideLine = $nav.find('#slide-line');
	var $currentItem = $nav.find('.active');
	// Menu has active item
	if ($currentItem[0]) {
		$slideLine.css({
			'width': $currentItem.width() + 16,
			'left': ($currentItem.parent().position().left + ($currentItem.parent().width() - $currentItem.width()) / 2 - 8)
		});
	}
}


// Init waypoints
var InitWaypointAnimations = function() {

	function setWayPoints(elements, params) {
		elements.each(function() {
			var element = $(this);
			var anim = element.attr('data-animation');
			var delay = element.attr('data-animation-delay') || params.delay;
			var offset = element.attr('data-animation-offset') || params.offset;
			element.css({'-webkit-animation-delay': delay, '-moz-animation-delay': delay, 'animation-delay': delay, opacity: 0});
			var l = element;
			l.waypoint(function() {
				element.addClass('animated').addClass(anim).css({opacity: 1});
			}, {
				triggerOnce:	!0,
				offset:			offset
			});
		});
	}

	/* function slowIterate(arr, params) {
		if (arr.length === 0) return;
		setWayPoints($(arr[0]), params);
		setTimeout(function() {
		  slowIterate(arr.slice(1), params);
		}, 1);
	} */

	return function(defaults) {
		defaults = defaults || {};
		var params = {
			offset:				defaults.offset || '95%',
			delay:				defaults.delay || '0s'
		};
		$('.animated').each(function(index, element) {
			setWayPoints($(element), params);
		});
		// slowIterate($('.animated'), params);
	};

}();

