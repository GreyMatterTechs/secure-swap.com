/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js, I18n.js
 * @file		Landpage.js
 * @version:	1.0.0
 * @author:		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 */

'use strict';

/**
 */
(function(window, undefined) {

	window.ssw = window.ssw || {};	// NameSpace

	if (window.ssw.Tools === undefined) { throw new Error('Please load Tools.js'); }
	if (window.ssw.I18n === undefined) { throw new Error('Please load I18n.js'); }

	// ---------- class Landpage

	// --- public static

	// constructeur public static
	window.ssw.Landpage = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Landpage.getInstance = function() {
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
		var locale;
		var clock = null;
		var updateICOIntervalDefault;
		var updateICOInterval = updateICOIntervalDefault;
		var updateICOIntervalId = null;
		var ethIntervalDefault = 60000;
		var ethInterval = ethIntervalDefault;
		var ethIntervalId = null;
		var momentLocale = window.navigator.language;
		var mailchimpLanguage = '';
		var roles = null;
		var ajaxDelay;
		var cmcURI;
		var grecKeyPub;
		var ethReceiveds = [];

		var icoState = 0;
		var tokenPriceUSD = 0.45;
		var coinMarketCapEUR = 409;
		var	coinMarketCapUSD = 477;
		var tokenPriceEUR = tokenPriceUSD * (coinMarketCapEUR / coinMarketCapUSD);
		var tokenPriceETH = tokenPriceUSD / coinMarketCapUSD;
		var purchaseSoldPercent, dateEnd, dateStart, tokensTotal, wallet, tokensSold, contractAddress;
		var purchaseboxLegal = false;


		// --- private methods

		function notifyEthReceiveds() {
			var i = ethReceiveds.length;
			while (i--) {
				if (!ethReceiveds[i].displayed) {
					var discount = ethReceiveds[i].discount < 1.0 ? $.i18n('notify.purchase.discount', (100 - (ethReceiveds[i].discount * 100)) + '%') : '';
					$.notify({
						icon:		'assets/images/unknown_users/' + (Math.floor(Math.random() * 23) + 1) + '.png',
						title:		$.i18n('notify.purchase.title'),
						message:	$.i18n('notify.purchase.message', (ethReceiveds[i].ethReceived).toFixed(8), discount, (+ethReceiveds[i].tokensSend).toFixed(3))
					}, {
						type:		'minimalist',
						placement:	{from: 'bottom', align: 'left'},
						delay:		5000,
						animate:	{enter: 'animated fadeInLeftBig', exit: 'animated fadeOutLeftBig'},
						icon_type:	'image',
						template:	'<div data-notify="container" class="alert alert-{0}" role="alert">' +
									'	<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
									'	<div id="image">' +
									'		<img data-notify="icon" class="rounded-circle float-left" />' +
									'	</div>' +
									'	<div id="text">' +
									'		<span data-notify="title">{1}</span>' +
									'		<span data-notify="message">{2}</span>' +
									'		<span data-notify="time">A few seconds ago.</span>' +
									'	</div>' +
									'</div>'
					});
					ethReceiveds[i].displayed = true;
				}
			}
		}

		function notifyJoin() {
			var nbBlink = 6;
			var blinkIntervalId = setInterval(function() {
				$('.blink').css('visibility', nbBlink % 2 === 0 ? 'hidden' : 'visible');
				if (nbBlink-- < 0) {
					clearInterval(blinkIntervalId);
				}
			}, 500);

			$.notify({
				icon:		'assets/images/join.png',
				title:		$.i18n('notify.join.title', 'Secure Swap'),
				message:	$.i18n('notify.join.message')
			}, {
				type:		'minimalist',
				placement:	{from: 'top', align: 'right'},
				delay:		5000,
				animate:	{enter: 'animated fadeInRightBig', exit: 'animated fadeOutRightBig'},
				mouse_over:	'pause',
				icon_type:	'image',
				template:	'<div data-notify="container" class="alert alert-{0}" role="alert">' +
							'	<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
							'	<div id="image">' +
							'		<img data-notify="icon" class="rounded-circle float-left" />' +
							'	</div>' +
							'	<div id="text">' +
							'		<span data-notify="title">{1}</span>' +
							'		<span data-notify="message">{2}</span><br />' +
							'		<button id="notify-join-submit" data-toggle="modal" data-target="#join-modal" ' +
							'			class="btn btn-sm btn-gradient-orange btn-glow mt-3" ' +
							'			data-i18n="notify.join.button" >Join our community</button>' +
							'	</div>' +
							'</div>'
			});
		}

		function updatePurchaseBoxContent() {
			var $box = $('#purchase-modal');
			if ($box.length === 1) {
				switch (icoState) {
				case 1:
					$('#purchase-modal-state-preico').removeClass('d-none');
					$('#purchase-modal-state-ico').addClass('d-none');
					$('#purchase-modal-state-postico').addClass('d-none');
					$('p[data-i18n="purchasebox.preico.intro"]').html($.i18n('purchasebox.preico.intro', moment(dateStart).format('LL')));
					$('#walletAddress').val('');
					$('#qrcode').attr('src', '');
					break;
				case 2:
					$('#purchase-modal-state-preico').addClass('d-none');
					$('#purchase-modal-state-ico').removeClass('d-none');
					$('#purchase-modal-state-postico').addClass('d-none');
					$('#qrcode').attr('src', 'assets/images/qr/' + locale + '.png');
					$('#walletAddress').val(wallet);
					break;
				}
			}
		}

		function closePurchaseBox() {
			var $box = $('#purchase-modal');
			if ($box.length === 1) {
			//	$box.find('.modal-body').html('');
				$box.modal('hide');
			}
		}

		function refreshTokenPrices() {
			tokenPriceEUR = tokenPriceUSD * (coinMarketCapEUR / coinMarketCapUSD);
			tokenPriceETH = tokenPriceUSD / coinMarketCapUSD;
			// $('#tokensale-eth').text($.i18n('tokensale-area.info.eth', tokenPriceUSD.toFixed(2), tokenPriceEUR.toFixed(3), tokenPriceETH.toFixed(8)));
			$('#tokensale-li7-val').text($.i18n('tokensale-area.info.eth',
				tokenPriceUSD.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', minimumFractionDigits: 2, maximumFractionDigits: 2}),
				tokenPriceEUR.toLocaleString(undefined, {style: 'currency', currency: 'EUR', currencyDisplay: 'symbol', minimumFractionDigits: 3, maximumFractionDigits: 3}),
				tokenPriceETH.toLocaleString(undefined, {style: 'decimal', minimumFractionDigits: 8, maximumFractionDigits: 8})));
			$('#token-distribution-data').text($.i18n('token-dist-area.data3.text',
				tokenPriceUSD.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', minimumFractionDigits: 2, maximumFractionDigits: 2}),
				tokenPriceEUR.toLocaleString(undefined, {style: 'currency', currency: 'EUR', currencyDisplay: 'symbol', minimumFractionDigits: 3, maximumFractionDigits: 3}),
				tokenPriceETH.toLocaleString(undefined, {style: 'decimal', minimumFractionDigits: 8, maximumFractionDigits: 8})));
		}

		function updateTokenSalesArea() {
			switch (icoState) {
			case 1:	$('#tokensale-title').html($.i18n('tokensale-area.info.start'));	break;
			case 2:	$('#tokensale-title').html($.i18n('tokensale-area.info.ends'));		break;
			case 3:	$('#tokensale-title').html($.i18n('tokensale-area.info.ended'));	break;
			}
			$('#tokensale-percent').html($.i18n('tokensale-area.info.percent', purchaseSoldPercent + (purchaseSoldPercent * 0.25)));
			$('#token-sale div.progress > div').css('width', purchaseSoldPercent + '%');
			refreshTokenPrices();
			$('#tokensale-li2-val').text($.i18n('tokensale-area.li2.value', moment(dateEnd).format('LL')));
			$('#tokensale-li3-val').text($.i18n('tokensale-area.li3.value', moment(dateStart).format('LL')));
			$('#tokensale-li6-val').text($.i18n('tokensale-area.li6.value', (tokensTotal * 0.8).toLocaleString(undefined, {style: 'decimal'})));
			$('#contractAddress').text(contractAddress);
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
			updateTokenSalesArea();
			updatePurchaseBoxContent(ico.state);
			$('#btn-purchase-sale').show();
			$('.loading-bar').show();
		}
		function setStateICO(ico) {
			// set timer to remaining time until ICO ends
			setTimerClock(ico.dateEnd);
			$('.clock-counter').show();
			$('.ico-ended').hide();
			updateTokenSalesArea();
			updatePurchaseBoxContent(ico.state);
			$('#btn-purchase-sale').show();
			$('.loading-bar').show();
		}
		function setStateEndICO(ico) {
			// remove flipclock
			if (clock) { clock.stop(); }
			$('.clock-counter').hide();
			$('.ico-ended').show();
			updateTokenSalesArea();
			closePurchaseBox();
			$('#btn-purchase-sale').hide();
			$('.loading-bar').hide();
			var usd = numeral(tokensSold * tokenPriceUSD).format('($ 0.00a)');
			var tok = numeral(tokensSold).format('0a');
			$('#tokensale-icoended-usd').text($.i18n('tokensale-area.info.icoended.li1', usd));
			$('#tokensale-icoended-token').text($.i18n('tokensale-area.info.icoended.li2', tok));
		}

		function updateICO() {
			$.get('/api/ICOs/GetICOData')
				.done(function(ico) {
					updateICOInterval = updateICOIntervalDefault;
					/* purchaseInterval = purchaseIntervalDefault; */
					if (ico) {
						tokenPriceUSD		= ico.tokenPriceUSD;
						purchaseSoldPercent	= Math.round(ico.tokensSold * 100 / ico.tokensTotal);
						dateEnd				= ico.dateEnd;
						dateStart			= ico.dateStart;
						tokensTotal			= ico.tokensTotal;
						tokensSold			= ico.tokensSold;
						wallet				= ico.wallet;
						icoState			= ico.state;
						contractAddress		= ico.contractAddress ? ico.contractAddress : $.i18n('tokensale-area.balance.address');
						switch (ico.state) {
						case 1:	setStatePreICO(ico);	break;
						case 2:	setStateICO(ico);		break;
						case 3:	setStateEndICO(ico);	break;
						}
						var past = (new Date).getTime() - 15000;
						ethReceiveds = ethReceiveds.filter(function(ethReceived) { return ethReceived.timestamp > past; });	// on supprime les vielles transactions
						if (ico.ethReceived.length > 0) {	// on "merge" les transactions reçues
							ico.ethReceived.forEach(function(thisObj) {
								var exists = false;
								ethReceiveds.forEach(function(globalObj) {
									if (globalObj.timestamp === thisObj.timestamp) exists = true;
								});
								if (!exists) ethReceiveds.push(thisObj);
							});
						}
						notifyEthReceiveds();
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

		/**
		 * Get crypto CoinMarketCap id
		 */
		function getCoinMarketCapId(cryptoName, cb) {
			var url = cmcURI + '/listings/';
			$.get(url)
				.done(function(list) {
					if (list) {
						var id = -1;
						list.data.some(function(element) {
							if (element.name === cryptoName) {
								id = Number(element.id);
								return true;
							}
						});
						return cb(null, id);
					}
					return cb('request() error. url:' + url, null);
				})
				.fail(function(err) {
					return cb(err, null);
				});
		}

		/**
		 * Get crypto quote on CoinMarketCap, in USD and in EUR
		 */
		function getCotation(cryptoId, cb) {
			var url = cmcURI + '/ticker/' + cryptoId + '/?convert=EUR';
			$.get(url)
				.done(function(cotation) {
					if (cotation) return cb(null, cotation);
					return cb('request() error. url:' + url, null);
				})
				.fail(function(err) {
					return cb(err, null);
				});
		}

		function updateETH() {
			getCoinMarketCapId('Ethereum', function(err, id) {
				if (id === null || id === -1) id = 1027;
				getCotation(id, function(err, cotation) {
					if (cotation) {
						ethInterval = ethIntervalDefault;
						coinMarketCapEUR = cotation.data.quotes.EUR.price;
						coinMarketCapUSD = cotation.data.quotes.USD.price;
						refreshTokenPrices();
					} else	{
						if (ethInterval < ethIntervalDefault * 100) ethInterval *= 2;
					}
				});
			});
		}
		function updateETHTimer() {
			if (ethIntervalId) clearInterval(ethIntervalId);
			updateETH();
			ethIntervalId = setInterval(updateETHTimer, ethInterval);
		}

		function CFValidate() {
			var valid = true;
			$('#contact-form input[type=text]').each(function(index) {
				if (index == 0) { // optional
					// if ($(this).val() == null || $(this).val() == '') {
						// $('#contact-form').find('input:eq(' + index + ')').addClass('required-error');
						// valid = false;
					// } else {
						$('#contact-form').find('input:eq(' + index + ')').removeClass('required-error');
					// }
				} else if (index == 1) { // optionnal
					if ($(this).val() == null || $(this).val() == '') {
						$('#contact-form').find('input:eq(' + index + ')').removeClass('required-error');
					} else if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
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

		function JBFValidate() {
			var valid = true;
			$('#joinbox-form input[type=text]').each(function(index) {
				if (index == 0) { // optional
					// if ($(this).val() == null || $(this).val() == '') {
						// $('#contact-form').find('input:eq(' + index + ')').addClass('required-error');
						// valid = false;
					// } else {
						$('#joinbox-form').find('input:eq(' + index + ')').removeClass('required-error');
					// }
				} else if (index == 1) {
					if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
						$('#joinbox-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#joinbox-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				}

			});
			return valid;
		}

		function HFValidate() {
			var valid = true;
			$('#head-form input[type=text]').each(function(index) {
				if (index == 0) {
					if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
						$('#head-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#head-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				}
			});
			return valid;
		}

		/**
		 * Checks if the given string is a checksummed address
		 *
		 * @method isChecksumAddress
		 * @private
		 * @param {String} address The given HEX adress
		 *
		 * @return {Boolean} True if address is a checksummed address
		*/
		function isChecksumAddress(address, cb) {
			$.ajax({
				type: 'POST',
				url: 'api/ICOs/isChecksumAddress',
				data: {address: address},
				success: function(result) {
					if (result.err)
						return cb(false);
					return cb(true);
				},
				error: function() {
					return cb(false);
				}
			});
		}

		/**
		 * Checks if the given string is an ETH address
		 *
		 * @method isETHAddress
		 * @private
		 * @param  {String} address The given HEX adress
		 *
		 * @return {Boolean} True if address is an ETH address
		*/
		function isETHAddress(address, cb) {
			if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) { // check if it has the basic requirements of an address
				return cb(false);
			} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) { // If it's all small caps or all all caps, return true
				return cb(true);
			} else { // Otherwise check each case
				isChecksumAddress(address, function(result) {
					return cb(result);
				});
			}
		}

		function RFValidate(cb) {
			var $inputs = $('#referralbox-form input[type=text]');
			async.eachOf($inputs, function($input, index, callback) {
				var val = $($input).val();
				if (index == 0) {
					if (val == null || val == '') {
						$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
						callback('empty');
					} else {
						isETHAddress(val, function(isETH) {
							if (isETH) {
								$('#referralbox-form').find('input:eq(' + index + ')').removeClass('required-error');
								callback();
							} else {
								$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
								callback('wrong');
							}
						});
					}
				} else if (index >= 1) {
					if (val == null || val == '') {
						callback();
					} else {
						isETHAddress(val, function(isETH) {
							if (isETH) {
								$('#referralbox-form').find('input:eq(' + index + ')').removeClass('required-error');
								callback();
							} else {
								$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
								callback('wrong');
							}
						});
					}
				}
			}, function(err) {
				if (err) {
					cb(false);
				} else {
					cb(true);
				}
			});
		}

		/**
		 * Check if the array contains duplicate ETH addresses
		 *
		 * @method sameAddresses
		 * @private
		 * @param {String[]} addresses array of addresses
		 *
		 * @return {Boolean} True if duplicates found
		 */
		function sameAddresses(addresses) {
			var same = false;
			addresses.some(function(row1, index1) {
				addresses.some(function(row2, index2) {
					if (index1 !== index2) {
						if (row1 !== '' && row2 !== '') {
							if (row1 === row2) {
								same = true;
								$('#referralbox-form').find('input:eq(' + index1 + ')').addClass('required-error');
								$('#referralbox-form').find('input:eq(' + index2 + ')').addClass('required-error');
								return true;
							}
						}
					}
				});
			});
			return same;
		}


		function sendContact(ser) {
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

		function sendJoin(ser) {
			//	if (mailchimpLanguage !== '') {
			//		ser += '&language=' + mailchimpLanguage;
			//	}
			$('#joinbox-debug-alert').hide();
			$('#joinbox-submit').text($.i18n('joinbox.button.sending'));
			$.ajax({
				type: 'POST',
				url: '/join',
				data: ser,
				success: function(result) {
					// var res = JSON.parse(result);
					if (result.err) {
						$('#joinbox-error-alert').html($.i18n(result.err));
						$('#joinbox-error-alert').fadeIn('slow');
						$('#joinbox-error-alert').delay(5000).fadeOut('slow');
					} else if (result.success) {
						$('#joinbox-form input[type=text]').val('');
						// $('#message').val('');
						$('#joinbox-success-alert').html($.i18n(result.success));
						$('#joinbox-success-alert').fadeIn('slow');
						$('#joinbox-success-alert').delay(5000).fadeOut('slow');
					}
					$('#joinbox-submit').text($.i18n('joinbox.button.submit'));
				},
				error: function() {
					$('#joinbox-error-alert').html($.i18n('joinbox.error.message2'));
					$('#joinbox-error-alert').fadeIn('slow');
					$('#joinbox-error-alert').delay(5000).fadeOut('slow');
					$('#joinbox-submit').text($.i18n('joinbox.button.submit'));
				}
			});
		}

		function sendHead(ser) {
			//	if (mailchimpLanguage !== '') {
			//		ser += '&language=' + mailchimpLanguage;
			//	}
			$('#head-debug-alert').hide();
			$('#head-submit').text($.i18n('head-area.button.sending'));
			$.ajax({
				type: 'POST',
				url: '/head',
				data: ser,
				success: function(result) {
					// var res = JSON.parse(result);
					if (result.err) {
						$('#head-error-alert').html($.i18n(result.err));
						$('#head-error-alert').fadeIn('slow');
						$('#head-error-alert').delay(5000).fadeOut('slow');
					} else if (result.success) {
						$('#head-form input[type=text]').val('');
						// $('#message').val('');
						$('#head-success-alert').html($.i18n(result.success));
						$('#head-success-alert').fadeIn('slow');
						$('#head-success-alert').delay(5000).fadeOut('slow');
					}
					$('#head-submit').text($.i18n('head-area.button.submit'));
				},
				error: function() {
					$('#head-error-alert').html($.i18n('head-area.error.message2'));
					$('#head-error-alert').fadeIn('slow');
					$('#head-error-alert').delay(5000).fadeOut('slow');
					$('#head-submit').text($.i18n('head-area.button.submit'));
				}
			});
		}


		// --- public methods

		return {

			init: function(_roles, _ajaxDelay, _cmcURI, _grecKeyPub) {

				if (_roles) {
					roles = JSON.parse(_roles);
				}
				ajaxDelay = _ajaxDelay || 5000;
				cmcURI = _cmcURI || 'https://api.coinmarketcap.com/v2';
				grecKeyPub = _grecKeyPub;
				updateICOIntervalDefault = ajaxDelay;

				i18n = window.ssw.I18n.getInstance();

				//--------------------------------------------------------------------------------------------------------------
				// Popups placemnt
				//--------------------------------------------------------------------------------------------------------------

				setTimeout(function() {
					$('.play-video').each(function() {
						$(this).tooltip({html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
					$('.vertical-social li.wip').each(function() {
						$(this).tooltip({placement: 'right', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
					$('.contact .contact-info > li:nth-child(2)').each(function() {
						$(this).tooltip({placement: 'left', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
					$('.footer .about a').each(function() {
						$(this).tooltip({placement: 'top', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
					$('.footer .tweets a').each(function() {
						$(this).tooltip({placement: 'left', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});

				}, 500);

				//--------------------------------------------------------------------------------------------------------------
				// Call to action buttons
				//--------------------------------------------------------------------------------------------------------------

				/* On button click, Smooth Scrolling */
				$('.head-content a[href*="#"]').not('[href="#"]').not('[href="#0"]').unbind('click').bind('click', function(event) {
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
								}
							});
						}
					}
				});
				$('#purchase-modal').on('show.bs.modal', function() {
					updatePurchaseBoxContent();
				});
				updatePurchaseBoxContent();

				// Fetch all the forms we want to apply custom Bootstrap validation styles to
				var forms = document.getElementsByClassName('legal-form');
				// Loop over them and prevent submission
				var validation = Array.prototype.filter.call(forms, function(form) {
					form.addEventListener('submit', function(event) {
						if (form.checkValidity() === false) {
							event.preventDefault();
							event.stopPropagation();
						}
						form.classList.add('was-validated');
						$('.section-1').hide();
						$('.section-2').show();
						event.preventDefault();
						purchaseboxLegal = true;
					}, false);
				});

				function myFunctionCopy() {
					/* Get the text field */
					var copyText = document.getElementById('SSW');
					/* Select the text field */
					copyText.select();
					/* Copy the text inside the text field */
					document.execCommand('Copy');
					/* Alert the copied text */
					alert('Copied the text: ' + copyText.value);
				}

				var currencyFrom = $('.currencyValueFrom');
				var currencyTo = $('.currencyValueTo');
				currencyFrom.on('input', function() {
					var amount = $(this).val();
					currencyTo.val(amount * coinMarketCapUSD / tokenPriceUSD);
				});
				currencyTo.on('input', function() {
					var amount = $(this).val();
					currencyFrom.val(amount * tokenPriceUSD / coinMarketCapUSD);
				});


				//--------------------------------------------------------------------------------------------------------------
				// About
				//--------------------------------------------------------------------------------------------------------------

				$('.about .advantages').hover(function() {
					$('.argument0').hide();
					var show = $(this).data('show');
					$('.' + show).show();
				}, function() {
					$('.arguments').children().hide();
					$('.argument0').show();
				});
				$('.arguments').children().hide();
				$('.argument0').show();

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
				var countdown = 100 * 24 * 60 * 60;
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
				// Token Yield
				//--------------------------------------------------------------------------------------------------------------

				function filterVE(value, type) {
					return value === 3000000 ? 1 : (value === 10000000 ? 1 : value === 20000000 ? 1 : 0);
				}
				function filterPX(value, type) {
					return value === 0.45 ? 1 : 0;
				}
				function clickOnPip(e) {
					var noUiSlider = this.noUiSlider;
					var value = Number(this.getAttribute('data-value'));
					noUiSlider.set(value);
				}
				var VEindex = 0;
				var FTAPindex = 1;
				var PXindex = 2;
				var sliders = document.getElementsByClassName('token-slider');
				var slidersData = [{
					value: 10000000,
					config: {
						start: [10000000],
						behaviour: 'tap-drag',
						connect: [true, false],
						tooltips: [{
							to: function(value) {
								return value.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0});
							}
						}],
						step: 1000000,
						range: {
							'min': [0],
							'max': [50000000]
						},
						pips: {
							mode: 'steps',
							density: 3,
							filter: filterVE,
							format: {
								to: function(value) {
									return value === 3000000 ? 'Top 100' : (value === 10000000 ? 'Top 75' : value === 20000000 ? 'Top 50' : '');
								}
							}
						}
					}
				}, {
					value: 50,
					config: {
						start: [50],
						behaviour: 'tap-drag',
						connect: [true, false],
						step: 1,
						tooltips: [{
							to: function(value) {
								return value.toFixed(0) + '%';
							}
						}],
						range: {
							'min': [1],
							'max': [100]
						}
					}
				}, {
					value: 0.45,
					config: {
						start: [0.45],
						behaviour: 'tap-drag',
						connect: [true, false],
						step: 0.01,
						tooltips: [{
							to: function(value) {
								return value.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2});
							}
						}],
						range: {
							'min': [0.01],
							'max': [1.00]
						},
						pips: {
							mode: 'steps',
							density: 3,
							filter: filterPX,
							format: {
								to: function(value) {
									return value.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' (ICO Price)';
								}
							}
						}
					}
				}];

				[].slice.call(sliders).forEach(function(slider, index) {
					noUiSlider.create(slider, slidersData[index].config);
					slider.noUiSlider.on('update', function() {
						slidersData[index].value = slider.noUiSlider.get();
						var result = ((((365 * slidersData[VEindex].value) * 0.0015) / (100000000 * (slidersData[FTAPindex].value / 100))) / slidersData[PXindex].value) * 100;
						$('.token-simu-percent').text(result.toFixed(0) + '%');
					});
					if (index === VEindex || index === PXindex) {
						var pips = sliders[index].querySelectorAll('.noUi-value');
						for (var i = 0; i < pips.length; i++) {
							pips[i].style.cursor = 'pointer';
							pips[i].noUiSlider = sliders[index].noUiSlider;
							pips[i].addEventListener('click', clickOnPip);
						}
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
					$p = $(this).parent().next();
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

				grecaptcha.ready(function() {
					grecaptcha.execute(grecKeyPub, {action: 'homepage'}).then(function(token) {
						$.ajax({
							type: 'POST',
							url: '/captcha',
							data: {token: token},
							success: function(result) {
								console.log('/captcha:' + JSON.stringify(result));
							},
							error: function(e) {
								console.log('/captcha:' + JSON.stringify(e));
							}
						});
					});
				});

				$('#contact-success-alert').hide();
				$('#contact-error-alert').hide();
				$('#contact-debug-alert').hide();
				$('#contact-submit').unbind('click').bind('click', function(e) {
					e.preventDefault();
					var valid = CFValidate();
					if (valid) {
						grecaptcha.ready(function() {
							grecaptcha.execute(grecKeyPub, {action: 'contact'}).then(function(token) {
								$.ajax({
									type: 'POST',
									url: '/captcha',
									data: {token: token},
									success: function(result) {
										console.log('/captcha:' + JSON.stringify(result));
										if (result.valid) {
											var ser = $('#contact-form').serialize();
											sendContact(ser);
										} else {
											$('#contact-error-alert').html($.i18n(result.err));
											$('#contact-error-alert').fadeIn('slow');
											$('#contact-error-alert').delay(5000).fadeOut('slow');
										}
									},
									error: function(e) {
										console.log('/captcha:' + JSON.stringify(e));
									}
								});
							});
						});
					}
				});
				$('#contact-name, #contact-mail, #contact-message').on('input change', function(e) {
					$(this).removeClass('required-error');
				});

				$('#head-success-alert').hide();
				$('#head-error-alert').hide();
				$('#head-debug-alert').hide();
				$('#head-submit').unbind('click').bind('click', function(e) {
					e.preventDefault();
					var valid = HFValidate();
					if (valid) {
						grecaptcha.ready(function() {
							grecaptcha.execute(grecKeyPub, {action: 'head'}).then(function(token) {
								$.ajax({
									type: 'POST',
									url: '/captcha',
									data: {token: token},
									success: function(result) {
										console.log('/captcha:' + JSON.stringify(result));
										if (result.valid) {
											var ser = $('#head-form').serialize();
											sendHead(ser);
										} else {
											$('#head-error-alert').html($.i18n(result.err));
											$('#head-error-alert').fadeIn('slow');
											$('#head-error-alert').delay(5000).fadeOut('slow');
										}
									},
									error: function(e) {
										console.log('/captcha:' + JSON.stringify(e));
									}
								});
							});
						});
					}
				});
				$('#head-mail').on('input change', function(e) {
					$(this).removeClass('required-error');
				});

				
				$('#joinbox-success-alert').hide();
				$('#joinbox-error-alert').hide();
				$('#joinbox-debug-alert').hide();
				$('#joinbox-submit').unbind('click').bind('click', function(e) {
					e.preventDefault();
					var valid = JBFValidate();
					if (valid) {
						grecaptcha.ready(function() {
							grecaptcha.execute(grecKeyPub, {action: 'joinbox'}).then(function(token) {
								$.ajax({
									type: 'POST',
									url: '/captcha',
									data: {token: token},
									success: function(result) {
										console.log('/captcha:' + JSON.stringify(result));
										if (result.valid) {
											var ser = $('#joinbox-form').serialize();
											sendJoin(ser);
										} else {
											$('#joinbox-error-alert').html($.i18n(result.err));
											$('#joinbox-error-alert').fadeIn('slow');
											$('#joinbox-error-alert').delay(5000).fadeOut('slow');
										}
									},
									error: function(e) {
										console.log('/captcha:' + JSON.stringify(e));
									}
								});
							});
						});
					}
				});
				$('#joinbox-name, #joinbox-mail').on('input change', function(e) {
					$(this).removeClass('required-error');
				});

				//--------------------------------------------------------------------------------------------------------------
				// Referral Form
				//--------------------------------------------------------------------------------------------------------------

				$('#referralbox-success-alert').hide();
				$('#referralbox-error-alert').hide();
				$('#referralbox-debug-alert').hide();
				$('#referralbox-submit').off('click.referralsubmit').on('click.referralsubmit', function(e) {
					e.preventDefault();
					$('[id^=referr]').removeClass('required-error');
					RFValidate(function(valid) {
						if (valid) {
							var ser = $('#referralbox-form').serialize();
							var list = ser.split('&');
							var addresses = list.map(function(el) { return el.split('=').pop(); });
							if (!sameAddresses(addresses)) {
								$('#referralbox-debug-alert').hide();
								$('#referralbox-submit').text($.i18n('referralbox.button.sending'));
								$.ajax({
									type: 'POST',
									url: 'api/ICOs/register',
									data: {ser: ser},
									success: function(result) {
										if (result.err) {
											$('#referralbox-error-alert').html($.i18n('referralbox.error.message2', result.err));
											$('#referralbox-error-alert').fadeIn('slow');
											$('#referralbox-error-alert').delay(5000).fadeOut('slow');
										} else {
											$('#referralbox-form input[type=text]').val('');
											$('#referralbox-success-alert').html($.i18n('referralbox.success.message'));
											$('#referralbox-success-alert').fadeIn('slow');
											$('#referralbox-success-alert').delay(5000).fadeOut('slow');
										}
										$('#referralbox-submit').text($.i18n('referralbox.button.register'));
									},
									error: function(err) {
										$('#referralbox-error-alert').html($.i18n('referralbox.error.message2', (err.responseJSON.error.code ? err.responseJSON.error.code : '0x1001')));
										$('#referralbox-error-alert').fadeIn('slow');
										$('#referralbox-error-alert').delay(5000).fadeOut('slow');
										$('#referralbox-submit').text($.i18n('referralbox.button.register'));
									}
								});
							}
						}
					});
				});
				$('[id^=referr]').on('input change', function(e) {
					$('[id^=referr]').removeClass('required-error');
				});
				var nbReferrals = 1;
				$('#referralbox-form').off('click.referraladd').on('click.referraladd', '#referralbox-add', function(e) {
					e.preventDefault();
					// supprimer ce bouton
					$('#referralbox-add').remove();
					// créer un nouvel input group
					nbReferrals++;
					$('.referrals-extent').append(
						'<div class="form-group">' +
						'	<div class="row">' +
						'		<div class="col-10">' +
						'			<input type="text" class="form-control" id="referral-' + nbReferrals + '" name="referral-' + nbReferrals + '" data-i18n="[placeholder]referralbox.placeholder.referral" placeholder="' + $.i18n('referralbox.placeholder.referral') + '">' +
						'		</div>' +
						'		<div class="col-1">' +
						'			<a id="referralbox-add" class="btn btn-sm btn-gradient-blue my-2 my-sm-0 mt-3" href="#" ><i class="fas fa-lg fa-plus" data-fa-transform="grow-20 down-6"></i></a>' +
						'		</div>' +
						'	</div>' +
						'</div>'
					);
					$('#referral-modal').modal('handleUpdate');
				});


				//--------------------------------------------------------------------------------------------------------------
				// Clipboard
				//--------------------------------------------------------------------------------------------------------------

				if (ClipboardJS.isSupported()) {
					var clipboard = new ClipboardJS('#btn-wallet-copy', {
						container: document.getElementById('purchase-modal')
					});
					clipboard.on('success', function(e) {
						e.clearSelection();
						$('#btn-wallet-copy')
							.addClass('copying')
							.one('animationend webkitAnimationEnd', function() {
								$('#btn-wallet-copy').removeClass('copying');
							});
					});
					clipboard.on('error', function(e) {
						console.error('Action:', e.action);
						console.error('Trigger:', e.trigger);
					});
				} else {
					$('#btn-wallet-copy').hide();
				}


				//--------------------------------------------------------------------------------------------------------------
				// Starts i18n, and run all scripts that requires localisation
				//--------------------------------------------------------------------------------------------------------------

				var i18nInitCallback = function(_locale, _mailchimpLanguage) {
					locale = _locale;
					moment.locale(_locale);
					mailchimpLanguage = _mailchimpLanguage;
					// once the locale file is loaded , we can start other inits that needs i18n ready
					$('input[placeholder]').i18n();
					$('#token-distribution-img-sales').attr('src', 'assets/images/piecharts/sales-' + _locale + '.png');
					$('#token-distribution-img-softcap').attr('src', 'assets/images/piecharts/softcap-' + _locale + '.png');
					$('#token-distribution-img-hardcap').attr('src', 'assets/images/piecharts/hardcap-' + _locale + '.png');
					$('#qrcode').attr('src', 'assets/images/qr/' + _locale + '.png');
					var copied = $.i18n('purchasebox.ico.address.copied');
					$('#btn-wallet-copied-label').data('label', copied).attr('data-label', copied);
				};

				var i18nUpdateCallback = function(_locale, _mailchimpLanguage) {
					locale = _locale;
					moment.locale(_locale);
					mailchimpLanguage = _mailchimpLanguage;
					// once the locale is changed, we can update each moduel that needs i18n strings
					$('input[placeholder]').i18n();
					updateTokenSalesArea();
					$('#token-distribution-img-sales').attr('src', 'assets/images/piecharts/sales-' + _locale + '.png');
					$('#token-distribution-img-softcap').attr('src', 'assets/images/piecharts/softcap-' + _locale + '.png');
					$('#token-distribution-img-hardcap').attr('src', 'assets/images/piecharts/hardcap-' + _locale + '.png');
					$('#qrcode').attr('src', 'assets/images/qr/' + _locale + '.png');
					var copied = $.i18n('purchasebox.ico.address.copied');
					$('#btn-wallet-copied-label').data('label', copied).attr('data-label', copied);
					if ($('.page-animated').length > 0) {
						InitWaypointAnimations();	// from theme.js
					}
				};

				i18n.init();
				i18n.buildGUI(i18nInitCallback, i18nUpdateCallback, roles);

				setTimeout(function() {
					updateICOTimer();
					updateETHTimer();
				}, 200);

				setTimeout(function() {
					notifyJoin();
				}, 5000);

				$(window).scroll(function() {
					if ($(this).scrollTop() > 200) {
						$('#scrollUp').css('right', '44px');
					} else {
						$('#scrollUp').removeAttr('style');
					}
				});
				$('#scrollUp').click(function(event) {
					event.preventDefault();
					$('html, body').animate({scrollTop: 0}, 300);
					return false;
				});

			} // end of init:function

		}; // end of return

	}; // end of ssw.Landpage = function() {

	// ---------- End class Landpage

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Landpage.getInstance().init(), false);

// EOF
