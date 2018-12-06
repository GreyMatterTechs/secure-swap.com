/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Privacy.js
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

	// ---------- class Privacy

	// --- public static

	// constructeur public static
	window.ssw.Privacy = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Privacy.getInstance = function() {
		if (instance) { return instance; }
		instance = new Privacy();
		return instance;
	};

	// --- private static

	// membres private static

	var instance = null;

	// Constructeur private static
	var Privacy = function() {

		// --- private members

		// --- private methods

		// --- public methods

		return {

			init: function() {

				//--------------------------------------------------------------------------------------------------------------
				// Popups placemnt
				//--------------------------------------------------------------------------------------------------------------


			} // end of init:function

		}; // end of return

	}; // end of ssw.Privacy = function() {

	// ---------- End class Privacy

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Privacy.getInstance().init(), false);

// EOF
