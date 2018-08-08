/**
 * Landpage.js
 * App for SecureSwap ICO website.
 *
 * Includes all of the following: Tools.js, I18n.js
 *
 * @version:	1.0.0
 * @author:		Philippe Aubessard, philippe@aubessard.net
 * @url         http://secureswap.com
 * @license:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ss_ico
 *
 */
'use strict';

(function(window, undefined) {

	window.ss_ico = window.ss_ico || {};	// NameSpace

	if (window.ss_ico.Tools === undefined) { throw new Error('Please load Tools.js'); }
	if (window.ss_ico.I18n === undefined) { throw new Error('Please load I18n.js'); }

	// ---------- class Landpage

	// --- public static

	// constructeur public static
	window.ss_ico.Landpage = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ss_ico.Landpage.getInstance = function() {
		if (instance) { return instance; }
		instance = new Landpage();
		return instance;
	};

	// --- private static

	// membres private static

	var instance = null;

	// Constructeur private static
	var Landpage = function() {

		// --- private members

		var i18n = null;
		var clock = null;
		var updateICOIntervalDefault = 3000;
		var updateICOInterval = updateICOIntervalDefault;
		var updateICOIntervalId = null;
		var ethIntervalDefault = 60000;
		var ethInterval = ethIntervalDefault;
		var ethIntervalId = null;
		var purchaseIntervalDefault = 3000;
		var purchaseInterval = purchaseIntervalDefault;
		var purchaseIntervalId = null;
		var momentLocale = window.navigator.language;
		var mailchimpLanguage = '';

		var icoState = 0;
		var tokenPriceUSD = 0.45;
		var coinMarketCapEUR = 409;
		var	coinMarketCapUSD = 477;
		var tokenPriceEUR = tokenPriceUSD * (coinMarketCapEUR / coinMarketCapUSD);
		var tokenPriceETH = tokenPriceUSD / coinMarketCapUSD;
		var purchaseSoldPercent, dateEnd, dateStart, tokensTotal;

		// --- private methods

		function notify(ethReceived) {
			// show notification about recent purchase
			var time = 'Few seconds ago';
			var icon = Math.floor(Math.random() * 16) + 1;
			$.notify({
				icon: 'assets/images/unknown_users/' + icon + '.png',
				title: 'Thank you',
				message: 'New purchase: <span class="blue">' + ethReceived.toFixed(5) + ' ETH</span> received.'
			}, {
				type: 'minimalist',
				placement: {
					from: 'bottom',
					align: 'left'
				},
				animate: {
					enter: 'animated fadeInLeftBig',
					exit: 'animated fadeOutLeftBig'
				},
				icon_type: 'image',
				template: '<div data-notify="container" class="alert alert-{0}" role="alert">' +
					'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
					'<div id="image">' +
					'<img data-notify="icon" class="rounded-circle float-left">' +
					'</div><div id="text">' +
					'<span data-notify="title">{1}</span>' +
					'<span data-notify="message">{2}</span>' +
					'<span data-notify="time">' + time + '</span>' +
					'</div>' +
					'</div>'
			});
		}

		function refreshTokenPrices() {
			tokenPriceEUR = tokenPriceUSD * (coinMarketCapEUR / coinMarketCapUSD);
			tokenPriceETH = tokenPriceUSD / coinMarketCapUSD;
			// $('#tokensale-eth').text($.i18n('tokensale-area.info.eth', tokenPriceUSD.toFixed(2), tokenPriceEUR.toFixed(3), tokenPriceETH.toFixed(8)));
			$('#tokensale-li7-val').text($.i18n('tokensale-area.info.eth', tokenPriceUSD.toFixed(2), tokenPriceEUR.toFixed(3), tokenPriceETH.toFixed(8)));
		}

		function updateTokenSalesArea() {
			switch (icoState) {
			case 1:	$('#tokensale-title').text($.i18n('tokensale-area.info.start'));	break;
			case 2:	$('#tokensale-title').text($.i18n('tokensale-area.info.ends'));		break;
			case 3:	$('#tokensale-title').text($.i18n('tokensale-area.info.ended'));	break;
			}
			$('#tokensale-percent').text($.i18n('tokensale-area.info.percent', purchaseSoldPercent));
			$('#token-sale-mobile-app div.progress > div').css('width', purchaseSoldPercent + '%');
			refreshTokenPrices();
			$('#tokensale-li2-val').text($.i18n('tokensale-area.li2.value', moment(dateEnd).format('LL')));
			$('#tokensale-li3-val').text($.i18n('tokensale-area.li3.value', moment(dateStart).format('LL')));
			$('#tokensale-li6-val').text($.i18n('tokensale-area.li6.value', tokensTotal));
		}

		function setTimerClock(icoDate) {
			// set timer to remaining time before ICO starts
			var date = new Date(icoDate);
			var now = new Date();
			var dif = Math.max(0, (date.getTime() - now.getTime()) / 1000);
			if (clock) {
				clock.stop();
				clock.setTime(dif);
				clock.start();
			}
		}

		function setStatePreICO(ico) {
			// set timer to remaining time before ICO starts
			setTimerClock(ico.dateStart);
			$('.clock-counter').show();
			$('.ico-ended').hide();
//			$('.loading-bar').css('margin-top', '0');
			// refresh translations
			$('#btn-purchase-sale').addClass('disabled');
			updateTokenSalesArea();
		}
		function setStateICO(ico) {
			// set timer to remaining time until ICO ends
			setTimerClock(ico.dateEnd);
			$('.clock-counter').show();
			$('.ico-ended').hide();
//			$('.loading-bar').css('margin-top', '0');
			// refresh translations
			$('#btn-purchase-sale').removeClass('disabled');
			updateTokenSalesArea();
		}
		function setStateEndICO(ico) {
			// remove flipclock
			if (clock) { clock.stop(); }
			$('.clock-counter').hide();
			$('.ico-ended').show();
//			$('.loading-bar').css('margin-top', '10rem');
			// refresh translations
			$('#btn-purchase-sale').addClass('disabled');
			updateTokenSalesArea();
		}

		function updateICO() {
			$.get('/api/ICOs/GetICOData')
				.done(function(ico) {
					updateICOInterval = updateICOIntervalDefault;
					if (ico) {
						tokenPriceUSD		= ico.tokenPriceUSD;
						purchaseSoldPercent	= Math.round(ico.tokensSold * 100 / ico.tokensTotal);
						dateEnd				= ico.dateEnd;
						dateStart			= ico.dateStart;
						tokensTotal			= ico.tokensTotal;
						if (ico.state !== icoState) {
							icoState = ico.state;
							switch (ico.state) {
							case 1:	setStatePreICO(ico);	break;
							case 2:	setStateICO(ico);		break;
							case 3:	setStateEndICO(ico);	break;
							}
						} else {
							updateTokenSalesArea();
						}
					}
				})
				.fail(function(err) {
					if (updateICOInterval < updateICOIntervalDefault * 100) updateICOInterval *= 2;
				});
		}
		function updateICOTimer() {
			if (updateICOIntervalId) clearInterval(updateICOIntervalId);
			updateICO();
			updateICOIntervalId = setInterval(updateICOTimer, updateICOInterval);
		}

		function updateETH() {
			$.get('https://api.coinmarketcap.com/v2/ticker/1027/?convert=EUR')
				.done(function(eth) {
					ethInterval = ethIntervalDefault;
					if (eth) {
						coinMarketCapEUR = eth.data.quotes.EUR.price;
						coinMarketCapUSD = eth.data.quotes.USD.price;
						refreshTokenPrices();
					}
				})
				.fail(function(err) {
					if (ethInterval < ethIntervalDefault * 100) ethInterval *= 2;
				});
		}
		function updateETHTimer() {
			if (ethIntervalId) clearInterval(ethIntervalId);
			updateETH();
			ethIntervalId = setInterval(updateETHTimer, ethInterval);
		}

		function updatePurchase() {
			$.get('/api/ICOs/getPurchase')
				.done(function(purchase) {
					purchaseInterval = purchaseIntervalDefault;
					if (purchase) {
						notify(purchase.ethReceived);
						purchaseSoldPercent	= Math.round(purchase.tokensSold * 100 / tokensTotal);
						if (purchase.state !== icoState) {
							updateICO();
						} else {
							updateTokenSalesArea();
						}
					}
				})
				.fail(function(err) {
					if (purchaseInterval < purchaseIntervalDefault * 100) purchaseInterval *= 2;
				});
		}
		function updatePurchaseTimer() {
			if (purchaseIntervalId) clearInterval(purchaseIntervalId);
			updatePurchase();
			purchaseIntervalId = setInterval(updatePurchaseTimer, purchaseInterval);
		}


		function CFValidate() {
			var valid = true;
			$('#contact-form input[type=text]').each(function(index) {
				if (index == 0) {
					if ($(this).val() == null || $(this).val() == '') {
						$('#contact-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#contact-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				} else if (index == 1) {
					if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
						$('#contact-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#contact-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				} else if (index == 2) {
					if ($(this).val() == null || $(this).val() == '') {
						$('#contact-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#contact-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				}

			});
			return valid;
		}


		// --- public methods

		return {

			init: function() {

				i18n = window.ss_ico.I18n.getInstance();

				//--------------------------------------------------------------------------------------------------------------
				// Call to action buttons
				//--------------------------------------------------------------------------------------------------------------

				/* On button click, Smooth Scrolling */
				$('.head-content a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
					if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
						var target = $(this.hash);
						target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
						if (target.length) {
							event.preventDefault();
							$('html, body').animate({
								scrollTop: target.offset().top
							}, 1000, function() {
								var $target = $(target);
								$target.focus();
								if ($target.is(':focus')) {
									return false;
								} else {
									$target.attr('tabindex', '-1');
									$target.focus();
								};
							});
						}
					}
				});

				//--------------------------------------------------------------------------------------------------------------
				// FlipClock Counter
				//--------------------------------------------------------------------------------------------------------------

				// http://www.dwuser.com/education/content/easy-javascript-jquery-countdown-clock-builder/
				FlipClock.Lang.Custom = {
					'years': '<span data-i18n="tokensale-area.flipclock.years"></span>',
					'months': '<span data-i18n="tokensale-area.flipclock.months"></span>',
					'days': '<span data-i18n="tokensale-area.flipclock.days"></span>',
					'hours': '<span data-i18n="tokensale-area.flipclock.hours"></span>',
					'minutes': '<span data-i18n="tokensale-area.flipclock.minutes"></span>',
					'seconds': '<span data-i18n="tokensale-area.flipclock.seconds"></span>'
				};
				var countdown = 10 * 24 * 60 * 60;
				clock = $('.clock').FlipClock(countdown, {
					clockFace: 'DailyCounter',
					countdown: true,
					language: 'Custom',
					classes: {
						active: 'flip-clock-active',
						before: 'flip-clock-before',
						divider: 'flip-clock-divider',
						dot: 'flip-clock-dot',
						label: 'flip-clock-label',
						flip: 'flip',
						play: 'play',
						wrapper: 'flip-clock-wrapper'
					}
				});

				//--------------------------------------------------------------------------------------------------------------
				// Token distribution
				//--------------------------------------------------------------------------------------------------------------

				//--------------------------------------------------------------------------------------------------------------
				// Team
				//--------------------------------------------------------------------------------------------------------------

				$('.team-member').hover(function() {
					$(this).next('.team-description').show();
					$(this).parent().addClass('team-hover');
					var $p;
					// TODO: récupérer les valeurs de width à partir de la config bootstrap...
					if (window.matchMedia('(min-width: 576px)').matches) { $p = $(this).parent().next(); }
					if (window.matchMedia('(min-width: 768px)').matches) { $p = $p.next(); }
					if (window.matchMedia('(min-width: 992px)').matches) { $p = $p.next(); }
					$p.css('visibility', 'hidden');
				}, function() {
					$('.team-description').hide();
					$('.team-profile > div > div').removeClass('team-hover').css('visibility', 'inherit');
				});

				//--------------------------------------------------------------------------------------------------------------
				// Contact Form
				//--------------------------------------------------------------------------------------------------------------

				$('#contact-success-alert').hide();
				$('#contact-error-alert').hide();
				$('#contact-debug-alert').hide();
				$('#contact-submit').click(function() {
					var valid = CFValidate();
					if (valid) {
						var ser = $('#contact-form').serialize();
						//	if (mailchimpLanguage !== '') {
						//		ser += '&language=' + mailchimpLanguage;
						//	}
						$('#contact-debug-alert').hide();
						$('#contact-submit').text($.i18n('contact-area.button.sending'));
						$.ajax({
							type: 'POST',
							url: '/contact',
							data: ser,
							success: function(result) {
								// var res = JSON.parse(result);
								if (result.err) {
									$('#contact-error-alert').html($.i18n(result.err));
									$('#contact-error-alert').fadeIn('slow');
									$('#contact-error-alert').delay(5000).fadeOut('slow');
								} else if (result.success) {
									$('#contact-form input[type=text]').val('');
									// $('#message').val('');
									$('#contact-success-alert').html($.i18n(result.success));
									$('#contact-success-alert').fadeIn('slow');
									$('#contact-success-alert').delay(5000).fadeOut('slow');
								}
								$('#contact-submit').text($.i18n('contact-area.button.submit'));
							},
							error: function() {
								$('#contact-error-alert').html($.i18n('contact-area.error.message2'));
								$('#contact-error-alert').fadeIn('slow');
								$('#contact-error-alert').delay(5000).fadeOut('slow');
								$('#contact-submit').text($.i18n('contact-area.button.submit'));
							}
						});
					}
				});
				$('#name, #mail, #message').on('input change', function(e) {
					$(this).removeClass('required-error');
				});

				//--------------------------------------------------------------------------------------------------------------
				// Starts i18n, and run all scripts that requires localisation
				//--------------------------------------------------------------------------------------------------------------

				var i18nInitCallback = function(_locale, _mailchimpLanguage) {
					moment.locale(_locale);
					mailchimpLanguage = _mailchimpLanguage;
					// once the locale file is loaded , we can start other inits that needs i18n ready
					$('input[placeholder]').i18n();
				};

				var i18nUpdateCallback = function(_locale, _mailchimpLanguage) {
					moment.locale(_locale);
					mailchimpLanguage = _mailchimpLanguage;
					// once the locale is changed, we can update each moduel that needs i18n strings
					$('input[placeholder]').i18n();
					$('tokensale-area.flipclock.years').i18n();
					$('tokensale-area.flipclock.months').i18n();
					$('tokensale-area.flipclock.days').i18n();
					$('tokensale-area.flipclock.hours').i18n();
					$('tokensale-area.flipclock.minutes').i18n();
					$('tokensale-area.flipclock.seconds').i18n();
					updateTokenSalesArea();
				};

				i18n.init();
				i18n.buildGUI(i18nInitCallback, i18nUpdateCallback);

				setTimeout(function() {
					updateICOTimer();
					updateETHTimer();
				}, 200);
				setTimeout(function() {
					updatePurchaseTimer();
				}, 2000);

			} // end of init:function

		}; // end of return

	}; // end of ss_ico.Landpage = function() {

	// ---------- End class Landpage

}(window));

window.ss_ico.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ss_ico.Landpage.getInstance().init(), false);

// EOF
