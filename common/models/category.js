/**
 * Module for Category database table related features.
 *
 * @module		Category
 * @file		This file defines the Category module.
 * @author		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright	Copyright (c) 2018, GreyMatterTechs.com. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const app		= reqlocal(path.join('server', 'server'));
const g			= reqlocal(path.join('node_modules', 'loopback', 'lib', 'globalize'));
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------


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
		logger.debug('Category.checkToken() token !String. e:' + e);
		return cb(e, null);
	}

	mAccessToken.findById(tokenId, function(err, accessToken) {
		if (err) {
			logger.debug('Category.checkToken() mAccessToken.findById failed. err:' + err);
			return cb(err, null);
		}
		if (accessToken) {
			accessToken.validate(function(err, isValid) {	// check user ACL and token TTL
				if (err) {
					logger.debug('Category.checkToken() validate failed. err:' + err);
					return cb(err, null);
				} else if (isValid) {
					mAdmin.findById(accessToken.userId, function(err, user) {	// check if user is active
						if (err) {
							logger.debug('Category.checkToken() mAdmin.findById failed. err:' + err);
							return cb(err, null);
						}
						if (!user || !user.active) {
							logger.debug('Category.checkToken() (!user || !user.active). e:' + e);
							return cb(e, null);
						}
						return cb(null, true);
					});
				} else {
					logger.debug('Category.checkToken() !isValid. e:' + e);
					return cb(e, null);
				}
			});
		} else {
			logger.debug('Category.checkToken() accessToken===null. e:' + e);
			return cb(e, null);
		}
	});
}


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} Category Model
 * @api public
 */
module.exports = function(Category) {

	Category.beforeRemote('**', function(ctx, modelInstance, next) {
		logger.info('model ' + ctx.req.method + ' \"' + ctx.req.baseUrl + ctx.req.path + '\"' + (ctx.req.clientIP ? ' from: ' + ctx.req.clientIP : '') + geo2str(ctx.req.geo));
		next();
	});

	

	/**
	 * Set all ICO params to database
	 * Usually called by secureswap node
	 *
	 * @method add
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {Array}    categories  ICO's parameters
	 * @callback {Function} cb      Callback function
	 * @param    {Error}    err     Error information
	 */
	Category.add = function(tokenId, category, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (!isString(category)) { logger.info('Category.add() bad param: ' + category); return cb(e2, null); }
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			Category.findOrCreate({name: category}, function(err, category) {
				if (err) return cb(err, null);
				return cb(null);
			});
		});
	};

};
