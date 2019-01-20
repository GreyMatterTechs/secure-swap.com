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

'use strict';

(function(window, undefined) {

	window.ssw = window.ssw || {}; // NameSpace

	// ---------- class Tools

	// --- public static

	// constructeur public static
	window.ssw.Tools = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Tools.getInstance = function() {
		if (instance) { return instance; }
		instance = new Tools();
		return instance;
	};

	// --- private static

	// membres private static
	let instance = null;

	// Constructeur private static
	const Tools = function() {

		// --- private members

		const self = this;

		// Sanitize tool taken from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
		const illegalRe = /[\/\?<>\\:\*\|":]/g;
		const controlRe = /[\x00-\x1f\x80-\x9f]/g;
		const reservedRe = /^\.+$/;
		const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
		const windowsTrailingRe = /[\. ]+$/;

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
			const charLength = string.length;
			const byteLength = 0;
			let codePoint = null;
			let prevCodePoint = null;
			for (let i = 0; i < charLength; i++) {
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
			const charLength = string.length;
			let curByteLength = 0;
			let codePoint;
			let segment;
			for (let i = 0; i < charLength; i += 1) {
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
			const sanitized = input.replace(illegalRe, replacement)
									.replace(controlRe, replacement)
									.replace(reservedRe, replacement)
									.replace(windowsReservedRe, replacement)
									.replace(windowsTrailingRe, replacement);
			return _truncate(sanitized, 255);
		}

		// ---------------------------------------------------------------------------------------------------------------------
		// UTF8
		// ---------------------------------------------------------------------------------------------------------------------

		const utf8_encode = function(argString) {
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

			if (argString === null || typeof argString === 'undefined') {
				return '';
			}

			const string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
			let utftext = '',
				start, end, stringl = 0;

			start = end = 0;
			stringl = string.length;
			for (let n = 0; n < stringl; n++) {
				let c1 = string.charCodeAt(n);
				let enc = null;

				if (c1 < 128) {
					end++;
				} else if (c1 > 127 && c1 < 2048) {
					enc = String.fromCharCode(
						(c1 >> 6) | 192,
						(c1 & 63) | 128
					);
				} else if (c1 & 0xF800 != 0xD800) {
					enc = String.fromCharCode(
						(c1 >> 12) | 224,
						((c1 >> 6) & 63) | 128,
						(c1 & 63) | 128
					);
				} else { // surrogate pairs
					if (c1 & 0xFC00 != 0xD800) { throw new RangeError('Unmatched trail surrogate at ' + n); }
					const c2 = string.charCodeAt(++n);
					if (c2 & 0xFC00 != 0xDC00) { throw new RangeError('Unmatched lead surrogate at ' + (n - 1)); }
					c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
					enc = String.fromCharCode(
						(c1 >> 18) | 240,
						((c1 >> 12) & 63) | 128,
						((c1 >> 6) & 63) | 128,
						(c1 & 63) | 128
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

			isEmpty: function(value, trim) {
				return value === undefined || value === null || value.length === 0 || (trim && $.trim(value) === '');
			},

			sanitize: function(input, options) {
				const replacement = (options && options.replacement) || '';
				const output = _sanitize(input, replacement);
				if (replacement === '') { return output; }
				return _sanitize(output, '');
			},

			getBool: function(val) {
				let num;
				return val != null && (!isNaN(num = +val) ? !!num : !!String(val).toLowerCase().replace(!!0,''));
			},

			getUrlVars: function() {
				const vars = {};
				const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
					function(m, key, value) {
						vars[key] = value;
					});
				return vars;
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Local Storage
			// ---------------------------------------------------------------------------------------------------------------------

			initLocalStorage: function() {
				if (Modernizr.localstorage) {
					// window.localStorage is available!
					try { this.localstorage = window.localStorage; } catch (e) {}	// Firefox crashes when executed as local file system
				} else {
					// no native support for local storage :(
					// try a fallback or another third-party solution
					alert('no local storage!');
				}
			}, // end of initLocalStorage

			lsGetString: function(key, defaultString) {
				if (this.localstorage && this.localstorage.getItem(key)) {
					return this.localstorage.getItem(key);
				} else {
					return defaultString;
				}
			},

			lsGetBool: function(key, defaultBool) {
				if (this.localstorage && this.localstorage.getItem(key)) {
					return this.localstorage.getItem(key) == 'true';
				} else {
					return defaultBool;
				}
			},

			lsGetInt: function(key, defaultInt) {
				if (this.localstorage && this.localstorage.getItem(key)) {
					return this.localstorage.getItem(key) * 1;
				} else {
					return defaultInt;
				}
			},

			lsGetObject: function(key, defaultObject) {
				if (this.localstorage && this.localstorage.getItem(key)) {
					return JSON.parse(this.localstorage.getItem(key));
				} else {
					return defaultObject;
				}
			},

			lsSetItem: function(key, value) {
				if (this.localstorage) {
					if (typeof value === 'object') {
						this.localstorage.setItem(key, JSON.stringify(value));
					} else {
						this.localstorage.setItem(key, value);
					}
				}
			},

			lsRemoveItem: function(key) {
				if (this.localstorage) {
					this.localstorage.removeItem(key);
				}
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Anti select
			// ---------------------------------------------------------------------------------------------------------------------

			initAntiSelect: function() {
				function disabletextselect() {	return false; }
				function renabletextselect() { return true;	}
				// if IE4+
				document.onselectstart = new Function('return false');
				// if NS6+
				if (window.sidebar) {
					document.onmousedown = disabletextselect;
					document.onclick = renabletextselect;
				}
			},

			noselection: function(target) {
				if (typeof target.onselectstart != 'undefined')
					target.onselectstart = function() { return false; };
				else if (typeof target.style.MozUserSelect != 'undefined')
					target.style.MozUserSelect = 'none';
				else
					target.onmousedown = function() { return false; };
				target.style.cursor = 'default';
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Kind of Defereds
			// ---------------------------------------------------------------------------------------------------------------------

			loadJsLib: function(jsPath, jsFile, callback, param) {
				$.when($.getScript(jsPath + '/' + jsFile)
					.fail(function(jqxhr, settings, exception) {
						throw new Error('Can\'t load ' + jsFile + '. Message: ' + exception.message);
					})
				)
				.done(function(arg) { /*arguments are [ "success", statusText, jqXHR ]*/
					if (callback)
						callback(param);
				})
				.fail(function(jqxhr, settings, exception) {
					throw new Error("When error. Message: " + exception.message);
				});
			},

			loadJsLib2: function (jsPath1, jsFile1, jsPath2, jsFile2, callback, param) {
				$.when($.getScript(jsPath1 + '/' + jsFile1)
					.fail(function (jqxhr, settings, exception) {
						throw new Error("Can't load " + jsFile1 + ". Message: " + exception.message);
					}),
					$.getScript(jsPath2 + '/' + jsFile2)
						.fail(function (jqxhr, settings, exception) {
							throw new Error("Can't load " + jsFile2 + ". Message: " + exception.message);
						})
				)
				.done(function (arg) { /*arguments are [ "success", statusText, jqXHR ]*/
					if (callback)
						callback(param);
				})
				.fail(function (jqxhr, settings, exception) {
					throw new Error("When error. Message: " + exception.message);
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
			doWhen: function(check, onComplete, delay, timeout) {
			    if (!delay) delay = 100;
			    let timeoutPointer = null;
			    let intervalPointer = null;
			    intervalPointer = setInterval(function() {
			        if (!check()) return; // if check didn't return true, means we need another check in the next interval
			        // if the check returned true, means we're done here. Clear the interval and the timeout and execute onComplete
			        clearInterval(intervalPointer);
			        if (timeoutPointer) clearTimeout(timeoutPointer);
			        onComplete();
			    }, delay);
			    if (timeout) timeoutPointer = setTimeout(function() {	// if after timeout milliseconds function doesn't return true, abort
			        clearInterval(intervalPointer);
			    }, timeout);
			},


			// ---------------------------------------------------------------------------------------------------------------------
			// Event Handlers
			// ---------------------------------------------------------------------------------------------------------------------

	        addEventHandler: function(element, eventName, listener, useCapture) {
	            if (element.addEventListener) {		// all browsers except IE before version 9
	            	element.addEventListener(eventName, listener, useCapture);
	            	return true;
	            } else if (element.attachEvent) {	// IE before version 9
	            	return element.attachEvent('on' + eventName, listener);
	            }
	            return false;
	        },

	        removeEventHandler: function(element, eventName, listener, useCapture) {
	            if (element.removeEventListener) {	// all browsers except IE before version 9
	            	element.removeEventListener(eventName, listener, useCapture);
	            	return true;
	            } else if (element.detachEvent) {	// IE before version 9
	            	return element.detachEvent('on' + eventName, listener);
	            }
	            return false;
	        }

		}; // end of return

	}; // end of var Tools = function() constructeur

	// ---------- End class Tools

}(window));

// EOF
