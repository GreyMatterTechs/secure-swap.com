/**
 * Module for KB database table related features.
 *
 * @module		KB
 * @file		This file defines the KB module.
 * @author		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright	Copyright (c) 2018, GreyMatterTechs.com. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const moment	= require('moment');
const Fuse		= require('fuse.js');
const app		= reqlocal(path.join('server', 'server'));
const g			= reqlocal(path.join('node_modules', 'loopback', 'lib', 'globalize'));
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var memCache	= [];


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------


function geo2str(geo) {
	if (geo) return ' (' + geo.city + ',' + geo.region + ',' + geo.country + ')';
	return '';
}

/**
 * Check if val is a String
 *
 * @method isString
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is a String
 */
function isString(val) {
	return Object.prototype.toString.call(val) === '[object String]';
	// return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
}

/**
 * @param {*} value
 * @return {boolean}
 */
function isObject(value) {
	// Avoid a V8 JIT bug in Chrome 19-20.
	// See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	var type = typeof value;
	return type === 'function' || (!!value && type == 'object');
}

/**
 * Check if val is a Date
 *
 * @method isDate
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is a Date
 */
function isDate(val) { // 2018-07-08T20:37:22.102Z or Timestamp
	return moment(val).isValid();
}

/**
 * Check if obj is an Array
 *
 * @method isArray
 * @private
 * @param {String} obj The value to check
 *
 * @return {Boolean} True if obj is an Array
 */
function isArray(obj) {
	return !Array.isArray ? Object.prototype.toString.call(obj) === '[object Array]' : Array.isArray(obj);
}

/**
 * Check access token validity
 *
 * @method checkToken
 * @private
 * @param    {String}   tokenId The token ID got from call to /login
 * @callback {Function} cb      Callback function
 * @param    {Error}    err     Error information
 * @param    {Boolean}  granted True if access is granted
 */
function checkToken(tokenId, cb) {
	const DEFAULT_TOKEN_LEN = 64; // taken from E:\DevGreyMatter\websites\secure-swap.com\node_modules\loopback\common\models\access-token.js
	const mAdmin = app.models.Admin;
	const mAccessToken = app.models.AccessToken;
	var e = new Error(g.f('Invalid Access Token'));
	e.status = e.statusCode = 401;
	e.code = e.errorCode = 'INVALID_TOKEN';

	if (!isString(tokenId) || tokenId.length !== DEFAULT_TOKEN_LEN) {
		logger.debug('KB.checkToken() token !String. e:' + e);
		return cb(e, null);
	}

	mAccessToken.findById(tokenId, function(err, accessToken) {
		if (err) {
			logger.debug('KB.checkToken() mAccessToken.findById failed. err:' + err);
			return cb(err, null);
		}
		if (accessToken) {
			accessToken.validate(function(err, isValid) {	// check user ACL and token TTL
				if (err) {
					logger.debug('KB.checkToken() validate failed. err:' + err);
					return cb(err, null);
				} else if (isValid) {
					mAdmin.findById(accessToken.userId, function(err, user) {	// check if user is active
						if (err) {
							logger.debug('KB.checkToken() mAdmin.findById failed. err:' + err);
							return cb(err, null);
						}
						if (!user || !user.active) {
							logger.debug('KB.checkToken() (!user || !user.active). e:' + e);
							return cb(e, null);
						}
						return cb(null, true);
					});
				} else {
					logger.debug('KB.checkToken() !isValid. e:' + e);
					return cb(e, null);
				}
			});
		} else {
			logger.debug('KB.checkToken() accessToken===null. e:' + e);
			return cb(e, null);
		}
	});
}


function initCache(KB, cb) {
	KB.find(function(err, kb) {
		if (err) return cb(err, null);
		kb.forEach(el => {
			memCache.push({title: el.title, text: el.text, categories: el.categories, tags: el.tags, author: el.author, date: el.date});
		});
		return cb(null, memCache);
	});
}


function search(cache, words, cb) {
	var options = {
		keys: [{
			name: 'text',
			weight: 0.3
		  }, {
			name: 'title',
			weight: 0.5
		  }, {
			name: 'tags',
			weight: 0.7
		  }],
		threshold: 0.5,
		findAllMatches: true,
		minMatchCharLength: 3,
		shouldSort: true,
		caseSensitive: false,
		includeMatches: true,
		includeScore: true
	};
	var fuse = new Fuse(cache, options);
	var res = fuse.search(words);
	return res;
}


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} KB Model
 * @api public
 */
module.exports = function(KB) {

	KB.beforeRemote('**', function(ctx, modelInstance, next) {
		logger.info('model ' + ctx.req.method + ' \"' + ctx.req.baseUrl + ctx.req.path + '\"' + (ctx.req.clientIP ? ' from: ' + ctx.req.clientIP : '') + geo2str(ctx.req.geo));
		next();
	});


	/**
	 * 
	 * Usually called by secureswap node
	 *
	 * @method add
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {Object}   kb      KB data
	 * @callback {Function} cb      Callback function
	 * @param    {Error}    err     Error information
	 */
	KB.add = function(tokenId, kb, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (!isObject(kb))			{ logger.info('KB.add() bad param: ' + kb); return cb(e2, null); }
		if (!isString(kb.text))		{ logger.info('KB.add() bad param: ' + kb.text); return cb(e2, null); }
		if (!isString(kb.author))	{ logger.info('KB.add() bad param: ' + kb.author); return cb(e2, null); }
		if (!isDate(kb.date))		{ logger.info('KB.add() bad param: ' + kb.date); return cb(e2, null); }
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			KB.create(kb, function(err, kb) {
				if (err) return cb(err, null);
				initCache(KB, function(err, cache) {});
				return cb(null);
			});
		});
	};

	/**
	 * 
	 * Usually called by secureswap node
	 *
	 * @method search
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {String}    words   KB data
	 * @callback {Function} cb      Callback function
	 * @param    {Error}    err     Error information
	 */
	KB.search = function(tokenId, words, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (!isString(words)) { logger.info('KB.search() bad param: ' + words); return cb(e2, null); }
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);

			// we use Fuse.js to have a better find tool
			// Fuse.js requires database in memory
			if (memCache.length === 0) {
				initCache(KB, function(err, cache) {
					if (err) return cb(err, null);
					return cb(null, search(cache, words));
				});
			} else {
				return cb(null, search(memCache, words));
			}
		});
	};

};
