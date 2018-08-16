/**
 * tools.js
 * Basic tools class.
 * 
 * Includes all of the following: 
 *
 * @version:	1.0.0
 * @author:		Philippe Aubessard, philippe@aubessard.net
 * @url         http://secure-swap.com
 * @license:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 *
 */

( function( window, undefined ) {
	'use strict';

	window.ssw = window.ssw || {}; // NameSpace

	// ---------- class Tools

	// --- public static

	// constructeur public static
	window.ssw.Tools = function() {
		throw new Error( 'Please use getInstance' );
	};

	// singleton factory public static
	window.ssw.Tools.getInstance = function() {
		if ( instance ) { return instance; }
		instance = new Tools();
		return instance;
	};

	// --- private static

	// membres private static
	var instance = null;

	// Constructeur private static
	var Tools = function() {

		// --- private members

		var self = this;
		
		// Sanitize tool taken from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
		var illegalRe = /[\/\?<>\\:\*\|":]/g;
		var controlRe = /[\x00-\x1f\x80-\x9f]/g;
		var reservedRe = /^\.+$/;
		var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
		var windowsTrailingRe = /[\. ]+$/;


		// --- private methods


		
		// ---------------------------------------------------------------------------------------------------------------------
		// Sanitize
		// ---------------------------------------------------------------------------------------------------------------------
		
		function _isHighSurrogate(codePoint) {
			return codePoint >= 0xd800 && codePoint <= 0xdbff;
		}

		function _isLowSurrogate(codePoint) {
			return codePoint >= 0xdc00 && codePoint <= 0xdfff;
		}

		function _getByteLength(string) {
			if (typeof string !== 'string') { throw new Error('Input must be string');	}
			var charLength = string.length;
			var byteLength = 0;
			var codePoint = null;
			var prevCodePoint = null;
			for (var i = 0; i < charLength; i++) {
				codePoint = string.charCodeAt(i);
				if (_isLowSurrogate(codePoint)) {
					if (prevCodePoint != null && _isHighSurrogate(prevCodePoint)) {	byteLength += 1; } 
					else {															byteLength += 3; }
				}
				else if (codePoint <= 0x7f) {										byteLength += 1; }
				else if (codePoint >= 0x80 && codePoint <= 0x7ff) {					byteLength += 2; }
				else if (codePoint >= 0x800 && codePoint <= 0xffff) {				byteLength += 3; }
				prevCodePoint = codePoint;
			}
			return byteLength;
		}

		// Truncate string by size in bytes
		function _truncate(string, byteLength) {
			if (typeof string !== 'string') { throw new Error('Input must be string'); }
			var charLength = string.length;
			var curByteLength = 0;
			var codePoint;
			var segment;
			for (var i = 0; i < charLength; i += 1) {
				codePoint = string.charCodeAt(i);
				segment = string[i];
				if (_isHighSurrogate(codePoint) && _isLowSurrogate(string.charCodeAt(i + 1))) {
					i += 1;
					segment += string[i];
				}
				curByteLength += _getByteLength(segment);
				if (curByteLength === byteLength) {			return string.slice(0, i + 1);	}
				else if (curByteLength > byteLength) {		return string.slice(0, i - segment.length + 1);	}
			}
			return string;
		}

		function _sanitize(input, replacement) {
			var sanitized = input.replace(illegalRe, replacement)
								 .replace(controlRe, replacement)
								 .replace(reservedRe, replacement)
								 .replace(windowsReservedRe, replacement)
								 .replace(windowsTrailingRe, replacement);
			return _truncate(sanitized, 255);
		}


		// ---------------------------------------------------------------------------------------------------------------------
		// Gui Settings
		// ---------------------------------------------------------------------------------------------------------------------
		
		function onLoad() {
			xNavigationOnresize();
			pageContentOnresize();
		}

		function pageContentOnresize() {
			var vpW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
			var vpH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
			$('.page-content,.content-frame-body,.content-frame-right,.content-frame-left').css('width', '').css('height', '');
			$('.sidebar .sidebar-wrapper').height(vpH);
			var content_minus = 0;
			content_minus = ($('.page-container-boxed').length > 0) ? 40 : content_minus;
			content_minus += ($('.page-navigation-top-fixed').length > 0) ? 50 : 0;
			var content = $('.page-content');
			var sidebar = $('.page-sidebar');
			if (content.height() < vpH - content_minus) {
				content.height(vpH - content_minus);
			}
			if (sidebar.height() > content.height()) {
				content.height(sidebar.height());
			}
			if ($('.page-content-adaptive').length > 0)
				$('.page-content-adaptive').css('min-height', vpH - 80);
		
			if (vpW > 1024) {
				if ($('.page-sidebar').hasClass('scroll')) {
					if ($('body').hasClass('page-container-boxed')) {
						var doc_height = vpH - 40;
					} else {
						var doc_height = vpH;
					}
					$('.page-sidebar').height(doc_height);
				}
				var offset = 170; // 162
				var fbm = $('body').hasClass('page-container-boxed') ? 200 : offset;
				var cfH = $('.content-frame').height();
				if ($('.content-frame-body').height() < vpH - offset) {
					var cfM = vpH - fbm < cfH - 80 ? cfH - 80 : vpH - fbm;
					$('.content-frame-body,.content-frame-right,.content-frame-left').height(cfM);
				} else {
					$('.content-frame-right,.content-frame-left').height($('.content-frame-body').height());
				}
				$('.content-frame-left').show();
				$('.content-frame-right').show();
			} else {
				$('.content-frame-body').height($('.content-frame').height() - 80);
				if ($('.page-sidebar').hasClass('scroll'))
					$('.page-sidebar').css('height', '');
			}
			if (vpW < 1200) {
				if ($('body').hasClass('page-container-boxed')) {
					$('body').removeClass('page-container-boxed').data('boxed', '1');
				}
			} else {
				if ($('body').data('boxed') === '1') {
					$('body').addClass('page-container-boxed').data('boxed', '');
				}
			}
			//$(window).trigger('resize');
		}


		/* X-NAVIGATION CONTROL FUNCTIONS */
		function xNavigationOnresize() {
			var inner_port = window.innerWidth || $(document).width();
			if (inner_port < 1025) {
				$('.page-sidebar .x-navigation').removeClass('x-navigation-minimized');
				$('.page-container').removeClass('page-container-wide');
				$('.page-sidebar .x-navigation li.active').removeClass('active');
				$('.x-navigation-horizontal').each(function () {
					if (!$(this).hasClass('x-navigation-panel')) {
						$('.x-navigation-horizontal').addClass('x-navigation-h-holder').removeClass('x-navigation-horizontal');
					}
				});
			} else {
				if ($('.page-navigation-toggled').length > 0) {
					xNavigationMinimize('close');
				}
				$('.x-navigation-h-holder').addClass('x-navigation-horizontal').removeClass('x-navigation-h-holder');
			}		
		}
		
		function xNavigationMinimize(action) {
			if (action == 'open') {
				$('.page-container').removeClass('page-container-wide');
				$('.page-sidebar .x-navigation').removeClass('x-navigation-minimized');
				$('.x-navigation-minimize').find('.fa').removeClass('fa-indent').addClass('fa-dedent');
				$('.page-sidebar.scroll').mCustomScrollbar('update');
			}
			if (action == 'close') {
				$('.page-container').addClass('page-container-wide');
				$('.page-sidebar .x-navigation').addClass('x-navigation-minimized');
				$('.x-navigation-minimize').find('.fa').removeClass('fa-dedent').addClass('fa-indent');
				$('.page-sidebar.scroll').mCustomScrollbar('disable', true);
			}
			$('.x-navigation li.active').removeClass('active');
		}
		
		function xNavigation() {
			$('.x-navigation-control').click(function () {
				$(this).parents('.x-navigation').toggleClass('x-navigation-open');
				onResize();
				return false;
			});
			if ($('.page-navigation-toggled').length > 0) {
				xNavigationMinimize('close');
			}
			if ($('.page-navigation-toggled-hover').length > 0) {
				$('.page-sidebar').hover(function () {
					$('.x-navigation-minimize').trigger('click');
				}, function () {
					$('.x-navigation-minimize').trigger('click');
				});
			}
			$('.x-navigation-minimize').click(function () {
				if ($('.page-sidebar .x-navigation').hasClass('x-navigation-minimized')) {
					$('.page-container').removeClass('page-navigation-toggled');
					xNavigationMinimize('open');
				} else {
					$('.page-container').addClass('page-navigation-toggled');
					xNavigationMinimize('close');
				}
				onResize();
				return false;
			});
			$('.x-navigation li > a').unbind('click').bind('click', function () {
				var li = $(this).parent('li');
				var ul = li.parent('ul');
				ul.find(' > li').not(li).removeClass('active');
			});
			$('.x-navigation li').unbind('click').bind('click', function (event) {
				event.stopPropagation();
				var li = $(this);
				if (li.children('ul').length > 0 || li.children('.panel').length > 0 || $(this).hasClass('xn-profile') > 0) {
					if (li.hasClass('active')) {
						li.removeClass('active');
						li.find('li.active').removeClass('active');
					} else
						li.addClass('active');
					onResize();
					if ($(this).hasClass('xn-profile') > 0)
						return true;
					else
						return false;
				}
			});
		}
		/* EOF X-NAVIGATION CONTROL FUNCTIONS */


		/* PAGE ON RESIZE WITH TIMEOUT */
		function onResize(timeout) {
			timeout = timeout ? timeout : 200;
			setTimeout(function () {
				pageContentOnresize();
			}, timeout);
		}
		/* EOF PAGE ON RESIZE WITH TIMEOUT */

			
		/* PANEL FUNCTIONS */
		function panelFullscreen(panel, callback) {
			if (panel.hasClass('panel-fullscreened')) {
				panel.removeClass('panel-fullscreened').unwrap();
				panel.find('.panel-body,.chart-holder').css('height', '');
				panel.find('.panel-fullscreen .fa').removeClass('fa-compress').addClass('fa-expand');
				$(window).resize();
				if (typeof callback === 'function')	callback(false);
			} else {
				var head = panel.find('.panel-heading');
				var body = panel.find('.panel-body');
				var footer = panel.find('.panel-footer');
				var hplus = 30;
				if (body.hasClass('panel-body-table') || body.hasClass('padding-0')) {
					hplus = 0;
				}
				if (head.length > 0) {
					hplus += head.height() + 21;
				}
				if (footer.length > 0) {
					hplus += footer.height() + 21;
				}
				panel.find('.panel-body,.chart-holder').height($(window).height() - hplus);
				panel.addClass('panel-fullscreened').wrap('<div class="panel-fullscreen-wrap"></div>');
				panel.find('.panel-fullscreen .fa').removeClass('fa-expand').addClass('fa-compress');
				$(window).resize();
				if (typeof callback === 'function')	callback(true);
			}
		}
		
		function panelCollapse(panel, callback) {
			if (panel.hasClass('panel-toggled')) {
				panel.removeClass('panel-toggled');
				panel.find('.panel-collapse .fa-angle-up').removeClass('fa-angle-up').addClass('fa-angle-down');
				if (typeof callback === 'function')	callback(false);
				onLoad();
			} else {
				panel.addClass('panel-toggled');
				panel.find('.panel-collapse .fa-angle-down').removeClass('fa-angle-down').addClass('fa-angle-up');
				if (typeof callback === 'function')	callback(true);
				onLoad();
			}
		}
		/*
		function panelRefresh(panel, action, callback) {
			if (!panel.hasClass('panel-refreshing')) {
				panel.append('<div class="panel-refresh-layer"><img src="img/loaders/default.gif"/></div>');
				panel.find('.panel-refresh-layer').width(panel.width()).height(panel.height());
				panel.addClass('panel-refreshing');
		
				if (action && action === 'shown' && typeof callback === 'function')
					callback();
			} else {
				panel.find('.panel-refresh-layer').remove();
				panel.removeClass('panel-refreshing');
		
				if (action && action === 'hidden' && typeof callback === 'function')
					callback();
			}
			onLoad();
		}
		*/
		
		function panelRemove(panel, callback) {
			panel.addClass('panel-removed');
			panel.animate({ 'opacity': 0 }, 200, function () {
				panel.parent('.panel-fullscreen-wrap').remove();
				$(this).remove();
				if (typeof callback === 'function')	callback(true);
				onLoad();
			});
		}
		
		/* EOF PANEL FUNCTIONS */


		// ---------------------------------------------------------------------------------------------------------------------
		// UTF8
		// ---------------------------------------------------------------------------------------------------------------------
		
		var utf8_encode = function(argString) {
		  // http://kevin.vanzonneveld.net
		  // + original by: Webtoolkit.info (http://www.webtoolkit.info/)
		  // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // + improved by: sowberry
		  // + tweaked by: Jack
		  // + bugfixed by: Onno Marsman
		  // + improved by: Yves Sucaet
		  // + bugfixed by: Onno Marsman
		  // + bugfixed by: Ulrich
		  // + bugfixed by: Rafal Kukawski
		  // + improved by: kirilloid
		  // + bugfixed by: kirilloid
		  // * example 1: utf8_encode('Kevin van Zonneveld');
		  // * returns 1: 'Kevin van Zonneveld'

		  if (argString === null || typeof argString === "undefined") {
			return '';
		  }

		  var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		  var utftext = '',
			start, end, stringl = 0;

		  start = end = 0;
		  stringl = string.length;
		  for (var n = 0; n < stringl; n++) {
			var c1 = string.charCodeAt(n);
			var enc = null;

			if (c1 < 128) {
			  end++;
			} else if (c1 > 127 && c1 < 2048) {
			  enc = String.fromCharCode(
				 (c1 >> 6) | 192,
				( c1 & 63) | 128
			  );
			} else if (c1 & 0xF800 != 0xD800) {
			  enc = String.fromCharCode(
				 (c1 >> 12) | 224,
				((c1 >> 6) & 63) | 128,
				( c1 & 63) | 128
			  );
			} else { // surrogate pairs
			  if (c1 & 0xFC00 != 0xD800) { throw new RangeError("Unmatched trail surrogate at " + n); }
			  var c2 = string.charCodeAt(++n);
			  if (c2 & 0xFC00 != 0xDC00) { throw new RangeError("Unmatched lead surrogate at " + (n-1)); }
			  c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
			  enc = String.fromCharCode(
				 (c1 >> 18) | 240,
				((c1 >> 12) & 63) | 128,
				((c1 >> 6) & 63) | 128,
				( c1 & 63) | 128
			  );
			}
			if (enc !== null) {
			  if (end > start) {
				utftext += string.slice(start, end);
			  }
			  utftext += enc;
			  start = end = n + 1;
			}
		  }

		  if (end > start) {
			utftext += string.slice(start, stringl);
		  }

		  return utftext;
		};


		// --- public members

		this.cssTransitionsSupport = false;
		this.localstorage = null;

	    var uA = navigator.userAgent,
	    	isIE = (uA.match(/msie/i)),
	    	isOpera = (uA.match(/opera/i)),
	    	isSafari = (uA.match(/safari/i)),
	    	isChrome = (uA.match(/chrome/i)),
	    	isFirefox = (uA.match(/firefox/i)),
	    	isTouchDevice = (uA.match(/ipad|iphone/i)),
	    	hasRealCanvas = (typeof window.G_vmlCanvasManager === 'undefined' && typeof document.createElement('canvas').getContext('2d') !== 'undefined');

/*
		var userSettings = {
			lang: 'fr-FR',
			menuCollapsed: false,
			currentMenu: 'dashboard',
			dashboard: 	{
							panel1: {
										expand: false,
										fullscreen: false
									}
						},
			profil:		{
							panel1: {
										tab: 'infos'
									},
							panel2: {
										tab: 'message'
									}
					
						},
			robots:		{
							robotTab: 'robot#1',
							strategyTab: 'strategy#1',
							contractTab: 'contract#1'
						},
			users:		{
							entries: 10,
							page: 1
						},
			strategies:	{
							entries: 10,
							page: 1
						},
			contracts: 	{
							licence: {
									expand: false,
									fullscreen: false,
									entries: 10,
									page: 1
							},
							maintenance: {
								expand: false,
								fullscreen: false,
								entries: 10,
								page: 1
							}
						},
			tasks: 		{
							filter: 'all'
						},
			chat:		{
							selectedRecipient: ''
						},
			faq:		{

						}
		};
*/

		// --- internal inits

		if (!window.btoa) window.btoa = $.base64.encode;
		if (!window.atob) window.atob = $.base64.decode;

		// --- public methods

		return {

			// ---------------------------------------------------------------------------------------------------------------------
			// Gui Settings
			// ---------------------------------------------------------------------------------------------------------------------
		


			// ---------------------------------------------------------------------------------------------------------------------
			// Strings
			// ---------------------------------------------------------------------------------------------------------------------
			
			ucfirst: function(text) {
				return text.substr(0, 1).toUpperCase() + text.substr(1);
			},

			isEmpty: function (value, trim) {
				return value === undefined || value === null || value.length === 0 || (trim && $.trim(value) === '');
			},
			
			sanitize: function (input, options) {
				var replacement = (options && options.replacement) || '';
				var output = _sanitize(input, replacement);
				if (replacement === '') {  return output;	}
				return _sanitize(output, '');
			},

			
			getBool: function (val) {
				var num; 
				return val != null && (!isNaN(num = +val) ? !!num : !!String(val).toLowerCase().replace(!!0,''));
			},
		 
			getUrlVars: function() {
				var vars = {};
				var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
					function(m,key,value) {
						vars[key] = value;
					}
				);
				return vars;
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Local Storage
			// ---------------------------------------------------------------------------------------------------------------------

			initLocalStorage: function() {
				if (Modernizr.localstorage) {
					// window.localStorage is available!
					try { this.localstorage = window.localStorage; } catch( e ){}	//Firefox crashes when executed as local file system
				} else {
					// no native support for local storage :(
					// try a fallback or another third-party solution
					alert('no local storage!');
				}
			}, // end of initLocalStorage

			lsGetString: function( key, defaultString ) {
				if ( this.localstorage && this.localstorage.getItem( key ) ) {
					return this.localstorage.getItem( key );
				} else {
					return defaultString;
				}
			},

			lsGetBool: function( key, defaultBool ) {
				if ( this.localstorage && this.localstorage.getItem( key ) ) {
					return this.localstorage.getItem( key ) == 'true';
				} else {
					return defaultBool;
				}
			},

			lsGetInt: function( key, defaultInt ) {
				if ( this.localstorage && this.localstorage.getItem( key ) ) {
					return this.localstorage.getItem( key ) * 1;
				} else {
					return defaultInt;
				}
			},

			lsGetObject: function( key, defaultObject ) {
				if ( this.localstorage && this.localstorage.getItem( key ) ) {
					return JSON.parse( this.localstorage.getItem( key ) );
				} else {
					return defaultObject;
				}
			},

			lsSetItem: function( key, value ) {
				if ( this.localstorage ) {
					if ( typeof value === "object" ) {
						this.localstorage.setItem( key, JSON.stringify(value) );
					} else {
						this.localstorage.setItem( key, value );
					}
				}
			},

			lsRemoveItem: function( key ) {
				if ( this.localstorage ) {
					this.localstorage.removeItem( key );
				}
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Anti select
			// ---------------------------------------------------------------------------------------------------------------------
			

			initAntiSelect: function() {
				function disabletextselect() {	return false; }
				function renabletextselect() { return true;	}
				//if IE4+
				document.onselectstart = new Function("return false");
				//if NS6+
				if (window.sidebar) {
					document.onmousedown = disabletextselect;
					document.onclick = renabletextselect;
				}
			},

			noselection: function(target) {
				if ( typeof target.onselectstart != "undefined" )
					target.onselectstart = function(){ return false; }
				else if ( typeof target.style.MozUserSelect != "undefined" )
					target.style.MozUserSelect = "none"
				else
					target.onmousedown = function(){ return false; }
				target.style.cursor = "default";
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Kind of Defereds
			// ---------------------------------------------------------------------------------------------------------------------
			

			loadJsLib: function( jsPath, jsFile, callback, param ) {
				$.when( $.getScript( jsPath + '/' + jsFile )
						 .fail( function( jqxhr, settings, exception ) {
							throw new Error( "Can't load " + jsFile + ". Message: "+ exception.message );
						 })
				)
				.done( function( arg ) { /*arguments are [ "success", statusText, jqXHR ]*/
					if ( callback )
						callback( param );
				})
				.fail( function( jqxhr, settings, exception ) {
					throw new Error( "When error. Message: "+ exception.message );
				});
			},

			loadJsLib2: function( jsPath1, jsFile1, jsPath2, jsFile2, callback, param ) {
				$.when( $.getScript( jsPath1 + '/' + jsFile1 )
						 .fail( function( jqxhr, settings, exception ) {
							throw new Error( "Can't load " + jsFile1 + ". Message: "+ exception.message );
						 }),
						$.getScript( jsPath2 + '/' + jsFile2 )
						 .fail( function( jqxhr, settings, exception ) {
							throw new Error( "Can't load " + jsFile2 + ". Message: "+ exception.message );
						 })
				)
				.done( function( arg ) { /*arguments are [ "success", statusText, jqXHR ]*/
					if ( callback )
						callback( param );
				})
				.fail( function( jqxhr, settings, exception ) {
					throw new Error( "When error. Message: "+ exception.message );
				});
			},


		    /**
		     * Waits until a certain function returns true and then executes a code. checks the function periodically
		     *
		     * @param {Function} check - A function that should return false or true
			 * @param {Function} onComplete - A function to execute when the check function returns true
			 * @param {Integer} delay - Time in milliseconds, specifies the time period between each check. default value is 100
			 * @param {Integer} timeout - Time in milliseconds, specifies how long to wait and check the check function before giving up
		     * @example
		     *      //basic usage
		     *      var globalVariable=0;
			 *		setTimeout( function() { globalVariable=1; }, 2000 );
			 *		doWhen(
			 *		    function() { return globalVariable==1; },
			 *		    function() { alert("done!"); }
			 *		);
		     */
			doWhen: function( check, onComplete, delay, timeout ) {
			    if ( !delay ) delay=100;
			    var timeoutPointer = null;
			    var intervalPointer = null;
			    intervalPointer = setInterval( function () {
			        if ( !check() ) return; // if check didn't return true, means we need another check in the next interval
			        // if the check returned true, means we're done here. Clear the interval and the timeout and execute onComplete
			        clearInterval( intervalPointer );
			        if ( timeoutPointer ) clearTimeout( timeoutPointer );
			        onComplete();
			    }, delay );
			    if ( timeout ) timeoutPointer = setTimeout( function() {	// if after timeout milliseconds function doesn't return true, abort
			        clearInterval( intervalPointer );
			    }, timeout );
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Event Handlers
			// ---------------------------------------------------------------------------------------------------------------------
			
	        addEventHandler: function( element, eventName, listener, useCapture ) {
	            if (element.addEventListener) {   // all browsers except IE before version 9
	            	element.addEventListener( eventName, listener, useCapture );
	            	return true;
	            } else if (element.attachEvent) {    // IE before version 9
	            	return element.attachEvent( "on"+eventName, listener );
	            }
	            return false;
	        },

	        removeEventHandler: function( element, eventName, listener, useCapture ) {
	            if (element.removeEventListener) {    // all browsers except IE before version 9
	            	element.removeEventListener( eventName, listener, useCapture );
	            	return true;
	            } else if (element.detachEvent) {        // IE before version 9
	            	return element.detachEvent( "on"+eventName, listener );
	            }
	            return false;
	        }

		}; // end of return

	}; // end of var Tools = function() constructeur

	// ---------- End class Tools

}(window));

// EOF