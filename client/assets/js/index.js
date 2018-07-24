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
		var clockIntervalDefault = 60000;
		var clockInterval = clockIntervalDefault;
		var clockIntervalId = null;
		var ethIntervalDefault = 60000;
		var ethInterval = ethIntervalDefault;
		var ethIntervalId = null;
		var purchaseIntervalDefault = 3000;
		var purchaseInterval = purchaseIntervalDefault;
		var purchaseIntervalId = null;
		var icoData = {};
		var momentLocale = window.navigator.language;
		var mailchimpLanguage = '';

		// --- private methods

		var tokenPriceUSD = 0.45;

		function updateTokeSaleArea(locale) {
			$('[data-i18n="tokensale-area.info.percent"]').text($.i18n('tokensale-area.info.percent', icoData.purchaseSoldPercent));
			// $('[data-i18n="tokensale-area.li1.value"]').text($.i18n('tokensale-area.li1.value', new Date(icoData.predateStart)));
			$('[data-i18n="tokensale-area.li2.value"]').text($.i18n('tokensale-area.li2.value', moment(icoData.dateEnd).format('LL')));
			$('[data-i18n="tokensale-area.li3.value"]').text($.i18n('tokensale-area.li3.value', moment(icoData.dateStart).format('LL')));
			// $('[data-i18n="tokensale-area.li4.value"]').text($.i18n('tokensale-area.li4.value', dateStart));
			// $('[data-i18n="tokensale-area.li5.value"]').text($.i18n('tokensale-area.li5.value', dateStart));
			$('[data-i18n="tokensale-area.li6.value"]').text($.i18n('tokensale-area.li6.value', icoData.tokensTotal));
		}

		function updateICO() {
			$.get('/api/ICOs/GetICOData')
				.done(function(ico) {
					clockInterval = clockIntervalDefault;
					if (ico) {
						icoData = ico;
						var date = new Date(ico.dateStart);
						var now = new Date();
						var dif = (date.getTime() - now.getTime()) / 1000;
						dif = Math.max(1, dif);
						if (dif <= 0) {
							dif = 0;
							$('#btn-purchase-sale').removeClass('disabled');
							$('#btn-purchase-head').show();
						}
						if (clock) {
							clock.stop();
							clock.setTime(dif);
							clock.start();
						}
						tokenPriceUSD = ico.tokenPriceUSD;
						var total = ico.tokensTotal;
						var sold = ico.tokensSold;
						icoData.purchaseSoldPercent = parseInt(sold * 100 / total);
						$('#token-sale-mobile-app div.progress > div').css('width', icoData.purchaseSoldPercent + '%');
						updateTokeSaleArea();
					}
				})
				.fail(function(err) {
					if (clockInterval < clockIntervalDefault * 100) clockInterval *= 2;
				});
		}
		function updateICOTimer() {
			if (clockIntervalId) clearInterval(clockIntervalId);
			updateICO();
			clockIntervalId = setInterval(updateICOTimer, clockInterval);
		}

		function updateETH() {
			$.get('https://api.coinmarketcap.com/v2/ticker/1027/?convert=EUR')
				.done(function(eth) {
					ethInterval = ethIntervalDefault;
					if (eth) {
						var tokenPriceEUR = tokenPriceUSD * (eth.data.quotes.EUR.price / eth.data.quotes.USD.price);
						var tokenPriceETH = tokenPriceUSD / eth.data.quotes.USD.price;
						$('#token-sale-mobile-app div.progress-bottom > div:nth-child(2)').text($.i18n('tokensale-area.info.eth', tokenPriceUSD.toFixed(2), tokenPriceEUR.toFixed(2), tokenPriceETH.toFixed(5)));
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
						var time = 'A minute ago';
						var icon = Math.floor(Math.random() * 16) + 1;
						$.notify({
							icon: 'assets/images/unknown_users/' + icon + '.png',
							title: 'Thank you',
							message: 'New purchase: <span class="blue">' + purchase + ' SSWT</span> tokens.'
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

				$('#btn-purchase-sale').addClass('disabled');
				$('#btn-purchase-head').hide();

				/* FlipClock Counter */
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

				// Radialize the colors
				Highcharts.setOptions({
					colors: Highcharts.map(Highcharts.getOptions().colors, function(color) {
						return {
							radialGradient: {
								cx: 0.5,
								cy: 0.3,
								r: 0.7
							},
							stops: [
								[0, color],
								[1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
							]
						};
					})
				});

				// Build the chart
				Highcharts.chart('token-dist-chart', {
					chart: {
						backgroundColor: 'transparent',
						plotBackgroundColor: null,
						plotBorderWidth: null,
						plotShadow: true,
						type: 'pie'
					},
				//	title: {
				//		text: 'Browser market shares in January, 2018'
				//	},
				//	tooltip: {
				//		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				//	},
					plotOptions: {
						pie: {
				//			allowPointSelect: true,
				//			cursor: 'pointer',
							dataLabels: {
								enabled: true,
								format: '<b>{point.name}</b>: {point.percentage:.1f} %',
								style: {
									color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
								},
								connectorColor: 'silver'
							}
						}
					},
					series: [{
						name: 'Distribution',
						data: [
							{ name: 'Crowdsale', y: 61.41 },
							{ name: 'Team', y: 11.84 },
							{ name: 'Advisors', y: 10.85 },
							{ name: 'Program', y: 4.67 },
							{ name: 'BugBounty', y: 4.18 },
							{ name: 'Other', y: 7.05 }
						]
					}]
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
				$('#name, #mail, #message').on('input change', function (e) {
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
					updateTokeSaleArea();
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
