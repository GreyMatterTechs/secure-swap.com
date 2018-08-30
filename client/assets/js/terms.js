/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Terms.js
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

	if (window.ssw.Tools === undefined) { throw new Error('Please load Tools.js'); }

	// ---------- class Terms

	// --- public static

	// constructeur public static
	window.ssw.Terms = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Terms.getInstance = function() {
		if (instance) { return instance; }
		instance = new Terms();
		return instance;
	};

	// --- private static

	// membres private static

	var instance = null;

	// Constructeur private static
	var Terms = function() {

		// --- private members

		// --- private methods

		// --- public methods

		return {

			init: function() {

				//--------------------------------------------------------------------------------------------------------------
				// Popups placemnt
				//--------------------------------------------------------------------------------------------------------------

				setTimeout(function() {
					$('.footer .about a').each(function() {
						$(this).tooltip({placement: 'top', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
					$('.footer .tweets a').each(function() {
						$(this).tooltip({placement: 'left', html: true, title: '<b>work in progress</b>', boundary: 'window', container: 'body', animation: true});
					});
				}, 500);

			} // end of init:function

		}; // end of return

	}; // end of ssw.Terms = function() {

	// ---------- End class Terms

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Terms.getInstance().init(), false);

// EOF
