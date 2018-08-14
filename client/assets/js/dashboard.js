/**
 * dashboard.js
 * App for SecureSwap ICO website.
 * 
 * Includes all of the following: Tools.js
 *
 * @version:	1.0.0
 * @author:		Philippe Aubessard, philippe@aubessard.net
 * @url         http://secureswap.com
 * @license:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 */

( function( window, undefined ) {
	'use strict';
	
	window.ssw = window.ssw || {};	// NameSpace

	if ( window.ssw.Tools === undefined ) { throw new Error( 'Please load Tools.js' ); }


	// ---------- class Dashboard

	// --- public static

	// constructeur public static
	window.ssw.Dashboard = function() {
		throw new Error( 'Please use getInstance' );
	};

	// singleton factory public static
	window.ssw.Dashboard.getInstance = function() {
		if ( instance ) { return instance; }
		instance = new Dashboard();
		return instance;
	};

	// --- private static

	// membres private static
	
	var instance = null;

	// Constructeur private static
	var Dashboard = function() {

		// --- private members

		var i18n			= null;

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

			init : function(jerr) {

				$('#error').hide();
				$('#success').hide();

				setTimeout(function() {
					$('body').addClass('loaded');
				}, 200);

				
				





				if (jerr) {
					var err = JSON.parse(jerr);
					if (typeof err === 'string' && err !=='' ) {
						$('#error-txt').text(err);
						$('#error').show();
					}
				}	

			}, // end of init:function

			dispose: function() {
			} // end of dispose

		}; // end of return

	}; // end of ssw.Dashboard = function() {

	// ---------- End class Dashboard

}(window));

window.ssw.Tools.getInstance().addEventHandler( document, "DOMContentLoaded", window.ssw.Dashboard.getInstance().init(), false );

// EOF