/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Login.js
 * @version:	1.0.0
 * @author:		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 */

'use strict';

/**
 * 
 */
(function(window, undefined) {

	window.ssw = window.ssw || {};	// NameSpace

	if (window.ssw.Tools === undefined ) { throw new Error('Please load Tools.js'); }

	// ---------- class Login

	// --- public static

	// constructeur public static
	window.ssw.Login = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Login.getInstance = function() {
		if (instance) { return instance; }
		instance = new Login();
		return instance;
	};

	// --- private static

	// membres private static

	var instance = null;

	// Constructeur private static
	var Login = function() {

		// --- private members

		// --- private methods

		var message = function(errCode) {
			var message = 'Unknown error';
			switch (errCode) {
			case 400:
			case 401:
			case 403:
			case 404: message = 'Login failed.'; // intentional unclear message to final user
			}
			$('#error-txt').text(message);
			$('#error').show();
		};


		// --- public methods

		return {

			init: function(jaction, jerr) {

				$('#error').hide();
				$('#success').hide();

				setTimeout(function() {
					$('body').addClass('loaded');
				}, 200);

				$('#login').off('click').on('click', function(e) {
					e.preventDefault();
					$.post(jaction, $('form').serialize())
						.done(function(data) {
							if (data.err) {
								message(data.err);
							} else {
								//	$('.content-wrapper').html(data);
								$('input[name="access_token"]').val(data.accessToken);
								$('input[name="roles"]').val(data.roles);
								$('form').submit();
							}
						})
						.fail(function(err) {
							message(err.status);
						});
				});
				$(document).on('click blur keydown', '.form-control', function(e) {
					$('#error').hide();
				});

				if (jerr) {
					var err = JSON.parse(jerr);
					if (typeof err === 'string' && err !== '') {
						$('#error-txt').text(err);
						$('#error').show();
					}
				}

			} // end of init:function

		}; // end of return

	}; // end of ssw.Login = function() {

	// ---------- End class Login

}(window));

// window.ssw.Tools.getInstance().addEventHandler( document, "DOMContentLoaded", window.ssw.Login.getInstance().init(), false );

// EOF
