/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Trans.js
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

	// ---------- class Trans

	// --- public static

	// constructeur public static
	window.ssw.Trans = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Trans.getInstance = function() {
		if (instance) { return instance; }
		instance = new Trans();
		return instance;
	};

	// --- private static

	// membres private static

	var instance	= null;
	

	// Constructeur private static
	var Trans = function() {

		// --- private members

		var aliveIntervalDefault = 60000;
		var aliveInterval = aliveIntervalDefault;
		var aliveIntervalId = null;
		var ajaxDelay;
		var tools		= null;
		var accessToken		= null;


		// --- private methods


		function updateAlive() {
			$.get('/api/ICOs/isAlive')
				.done(function(alive) {
					aliveInterval = aliveIntervalDefault;
					if (alive) {
						$('#greenlight').show();
						$('#redlight').hide();
					} else {
						$('#greenlight').hide();
						$('#redlight').show();
					}
				})
				.fail(function(err) {
					if (aliveInterval < aliveIntervalDefault * 100) aliveInterval *= 2;
				});
		}
		function updateAliveTimer() {
			if (aliveIntervalId) clearInterval(aliveIntervalId);
			updateAlive();
			aliveIntervalId = setInterval(updateAliveTimer, aliveInterval);
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


		function RFValidate() {
			var valid = true;
			$('#referralbox-form input[type=text]').each(function(index) {
				if (index == 0) {
					if ($(this).val() == null || $(this).val() == '') {
						$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						isETHAddress($(this).val(), function(isETH) {
							if (isETH) {
								$('#referralbox-form').find('input:eq(' + index + ')').removeClass('required-error');
							} else {
								$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
								valid = false;
							}
						});
					}
				} else if (index == 1) {
					if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
						$('#referralbox-form').find('input:eq(' + index + ')').addClass('required-error');
						valid = false;
					} else {
						$('#referralbox-form').find('input:eq(' + index + ')').removeClass('required-error');
					}
				}
			});
			return valid;
		}


		function initReferralForm() {
			$('#referralbox-success-alert').hide();
			$('#referralbox-error-alert').hide();
			$('#referralbox-debug-alert').hide();
			$('#referralbox-submit').off('click.referralsubmit').on('click.referralsubmit', function(e) {
				e.preventDefault();
				$('#referralbox-debug-alert').hide();
				$('#referralbox-submit').text('Sending...');
				if (RFValidate()) {
					var ser = $('#referralbox-form').serialize();
					var url = 'http://' + 'localhost' + ':' + '3000' + '/api/ICOs/getReferrals';
					$.ajax({
						type: 'POST',
						url: url,
						data: {ser: ser},
						success: function(result) {
							if (result.err) {
								$('#referralbox-error-alert').text(result.err);
								$('#referralbox-error-alert').fadeIn('slow');
								$('#referralbox-error-alert').delay(10000).fadeOut('slow');
							} else {
								$('#referralbox-form input[type=text]').val('');
								$('#referralbox-success-alert').text('Successfully sent.');
								$('#referralbox-success-alert').fadeIn('slow');
								$('#referralbox-success-alert').delay(5000).fadeOut('slow');
							}
							$('#referralbox-submit').text('Send');
						},
						error: function(err) {
							$('#referralbox-error-alert').text('Internal error. code: ' + (err.responseJSON.error.code ? err.responseJSON.error.code : '0x1001'));
							$('#referralbox-error-alert').fadeIn('slow');
							$('#referralbox-error-alert').delay(10000).fadeOut('slow');
							$('#referralbox-submit').text('Send');
						}
					});
				} else {
					$('#referralbox-submit').text('Send');
				}
			});
			$('[id^=referr]').on('input change', function(e) {
				$('[id^=referr]').removeClass('required-error');
			});
		}


		// --- public methods

		return {

			init: function(_username, _ajaxDelay, _accessToken) {

				ajaxDelay = _ajaxDelay || 5000;
				accessToken = _accessToken;
				tools = window.ssw.Tools.getInstance();

				updateAliveTimer();
				initReferralForm();

			} // end of init:function

		}; // end of return

	}; // end of ssw.Trans = function() {

	// ---------- End class Trans

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Trans.getInstance().init(), false);

// EOF
