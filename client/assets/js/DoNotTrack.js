/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		DoNotTrack.js
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

	// ---------- class DoNotTrack

	// --- public static

	// constructeur public static
	window.ssw.DoNotTrack = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.DoNotTrack.getInstance = function() {
		if (instance) { return instance; }
		instance = new DoNotTrack();
		return instance;
	};

	// --- private static

	// membres private static

	var instance = null;

	// Constructeur private static
	var DoNotTrack = function() {

		// --- private members

		// --- private methods

		// --- public methods

		return {

			init: function() {


			} // end of init:function

		}; // end of return

	}; // end of ssw.DoNotTrack = function() {

	// ---------- End class DoNotTrack

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.DoNotTrack.getInstance().init(), false);

// EOF
