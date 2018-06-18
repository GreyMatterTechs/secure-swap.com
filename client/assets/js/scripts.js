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

( function( window, undefined ) {
  'use strict';
	
  window.ss_ico = window.ss_ico || {};	// NameSpace

	if ( window.ss_ico.Tools === undefined ) { throw new Error( 'Please load Tools.js' ); }
	if ( window.ss_ico.I18n === undefined ) { throw new Error( 'Please load I18n.js' ); }

	// ---------- class Landpage

	// --- public static
  
  // constructeur public static
	window.ss_ico.Landpage = function() {
		throw new Error( 'Please use getInstance' );
	};

	// singleton factory public static
	window.ss_ico.Landpage.getInstance = function() {
		if ( instance ) { return instance; }
		instance = new Login();
		return instance;
	};

	// --- private static

	// membres private static
	
	var instance = null;

	// Constructeur private static
	var Landpage = function() {

		// --- private members

		var i18n			= null;

    	// --- private methods

		// --- public methods

		return {

			init : function() {

				i18n = window.ss_ico.I18n.getInstance();
                
        
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
        };

        i18n.init(i18nInitCallback, i18nUpdateCallback);
      
			}, // end of init:function

			dispose: function() {
			} // end of dispose

		}; // end of return

	}; // end of ss_ico.Landpage = function() {

	// ---------- End class Landpage

}(window));

window.ss_ico.Tools.getInstance().addEventHandler( document, "DOMContentLoaded", window.ss_ico.Landpage.getInstance().init(), false );

// EOF