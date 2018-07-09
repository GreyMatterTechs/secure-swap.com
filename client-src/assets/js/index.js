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

(function(window, undefined) {
	'use strict';

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
		

		// --- private methods

		function updateICO() {
			$.get('/api/ICOs/GetICOData')
				.done(function(ico) {
					clockInterval = clockIntervalDefault;
					if (ico) {
						var date = new Date(ico.dateStart);
						var now = new Date();
						var dif = (date.getTime() - now.getTime()) / 1000;
						dif = Math.max(1, dif);
						if (dif < 0) dif = 0;
						if (clock) {
							clock.stop();
							clock.setTime(dif);
							clock.start();
						}
						var total = ico.tokensTotal;
						var sold = ico.tokensSold;
						var purchaseSoldPercent = parseInt(sold * 100 / total);
						$('div.progress > div').css('width', purchaseSoldPercent + '%');
						$('div.progress-bottom > div:nth-child(1)').text($.i18n('tokensale-area.info.percent', purchaseSoldPercent));
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


		// --- public methods

		return {

			init: function() {

				i18n = window.ss_ico.I18n.getInstance();



				/* FlipClock Counter */
				//http://www.dwuser.com/education/content/easy-javascript-jquery-countdown-clock-builder/
				FlipClock.Lang.Custom = {
					'years': '<span data-i18n="tokensale-area.flipclock.years"></span>',
					'months': '<span data-i18n="tokensale-area.flipclock.months"></span>',
					'days': '<span data-i18n="tokensale-area.flipclock.days"></span>',
					'hours': '<span data-i18n="tokensale-area.flipclock.hours"></span>',
					'minutes': '<span data-i18n="tokensale-area.flipclock.minutes"></span>',
					'seconds': '<span data-i18n="tokensale-area.flipclock.seconds"></span>',
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
						wrapper: 'flip-clock-small-wrapper'
					}
				});



				//--------------------------------------------------------------------------------------------------------------
				// Starts i18n, and run all scripts that requires localisation
				//--------------------------------------------------------------------------------------------------------------

				var i18nInitCallback = function() {
					// once the locale file is loaded , we can start other inits that needs i18n ready
					$('input[placeholder]').i18n();
				};

				var i18nUpdateCallback = function() {
					// once the locale is changed, we can update each moduel that needs i18n strings
					$('input[placeholder]').i18n();
					$('tokensale-area.flipclock.years').i18n();
					$('tokensale-area.flipclock.months').i18n();
					$('tokensale-area.flipclock.days').i18n();
					$('tokensale-area.flipclock.hours').i18n();
					$('tokensale-area.flipclock.minutes').i18n();
					$('tokensale-area.flipclock.seconds').i18n();
			//		$('div.progress-bottom > div:nth-child(1)').text($.i18n('tokensale-area.info.percent', purchaseSoldPercent));
				};

				i18n.init();
				i18n.buildGUI(i18nInitCallback, i18nUpdateCallback);
				
				updateICOTimer();

			}, // end of init:function

			dispose: function() {
			} // end of dispose

		}; // end of return

	}; // end of ss_ico.Landpage = function() {

	// ---------- End class Landpage

}(window));

window.ss_ico.Tools.getInstance().addEventHandler(document, "DOMContentLoaded", window.ss_ico.Landpage.getInstance().init(), false);

// EOF
