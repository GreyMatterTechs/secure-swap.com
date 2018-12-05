/**
 * Module for ICO database table related features.
 *
 * @module		ICO
 * @file		This file defines the ICO module.
 * @author		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright	Copyright (c) 2018, GreyMatterTechs.com. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const CryptoJS	= require('crypto-js');
const sha3		= require('crypto-js/sha3');
const moment	= require('moment');
const request	= require('superagent');
const app		= reqlocal(path.join('server', 'server'));
const g			= reqlocal(path.join('node_modules', 'loopback', 'lib', 'globalize'));
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var icoServerIsAlive = false;
var icoServerIsAliveTs = moment();
var aliveIntervalDefault = 60000;
var aliveInterval = aliveIntervalDefault;
var aliveIntervalId = null;

// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------


function updateAlive() {
	var now = moment();
	if (now.isAfter(icoServerIsAliveTs.clone().add(10, 'minute'))) {
		icoServerIsAlive = false;
	}
}
function updateAliveTimer() {
	if (aliveIntervalId) clearInterval(aliveIntervalId);
	updateAlive();
	aliveIntervalId = setInterval(updateAliveTimer, aliveInterval);
}


/**
 * Checks if the given string is an ETH address
 *
 * @method isETHAddress
 * @private
 * @param  {String} address The given HEX adress
 *
 * @return {Boolean} True if address is an ETH address
*/
function isETHAddress(address) {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) { // check if it has the basic requirements of an address
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) { // If it's all small caps or all all caps, return true
		return true;
	} else { // Otherwise check each case
		return isChecksumAddress(address);
	}
}

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @private
 * @param {String} address The given HEX adress
 *
 * @return {Boolean} True if address is a checksummed address
*/
function isChecksumAddress(address) {
	// Check each case
	address = address.replace('0x', '');
	var addressHash = sha3(address.toLowerCase(), {outputLength: 256}).toString();
	for (var i = 0; i < 40; i++) {
		// the nth letter should be uppercase if the nth digit of casemap is 1
		if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
			return false;
		}
	}
	return true;
}

/**
 * Check if val is a Number
 *
 * @method isNumber
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is a Number
 */
function isNumber(val) {
	return isFloat(val) || isInteger(val);
}

/**
 * Check if val is a Float
 *
 * @method isFloat
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is a Float
 */
function isFloat(val) {
	return !isNaN(val) && val.toString().indexOf('.') !== -1;
}

/**
 * Check if val is an Interger
 *
 * @method isInteger
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is an Integer
 */
function isInteger(val) {
	return !isNaN(val) && val.toString().indexOf('.') === -1;
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
 * Check if val is a Date
 *
 * @method isDate
 * @private
 * @param {String} val The value to check
 *
 * @return {Boolean} True if the val is a Date
 */
function isDate(val) { // 2018-07-08T20:37:22.102Z or Timestamp
	// logger.info('ICO.isDate() val: ' + val);

	// logger.info('ICO.isDate() invalid at: ' + moment(val).invalidAt());

	return moment(val).isValid();
}

/**
 * Check if obj is an Object
 *
 * @method isObject
 * @private
 * @param {*} obj The object to check
 *
 * @return {Boolean} True if obj is a literal Object
 *
 * @example
 * console.log(isObject(        )); // false
 * console.log(isObject(    null)); // false
 * console.log(isObject(    true)); // false
 * console.log(isObject(       1)); // false
 * console.log(isObject(   'str')); // false
 * console.log(isObject(      [])); // false
 * console.log(isObject(new Date)); // false
 * console.log(isObject(      {})); // true
 */
function isObject(obj) {
	return (!!obj) && (obj.constructor === Object);
}

/**
 * Check if the array contains duplicate ETH addresses
 *
 * @method sameAddresses
 * @private
 * @param {String[]} addresses array of addresses
 *
 * @return {Boolean} True if duplicates found
 */
function sameAddresses(addresses) {
	var same = false;
	addresses.some(function(row1, index1) {
		addresses.some(function(row2, index2) {
			if (index1 !== index2) {
				if (row1 === row2) {
					same = true;
					return true;
				}
			}
		});
	});
	return same;
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
		logger.debug('ICO.checkToken() token !String. e:' + e);
		return cb(e, null);
	}

	mAccessToken.findById(tokenId, function(err, accessToken) {
		if (err) {
			logger.debug('ICO.checkToken() mAccessToken.findById failed. err:' + err);
			return cb(err, null);
		}
		if (accessToken) {
			accessToken.validate(function(err, isValid) {	// check user ACL and token TTL
				if (err) {
					logger.debug('ICO.checkToken() validate failed. err:' + err);
					return cb(err, null);
				} else if (isValid) {
					mAdmin.findById(accessToken.userId, function(err, user) {	// check if user is active
						if (err) {
							logger.debug('ICO.checkToken() mAdmin.findById failed. err:' + err);
							return cb(err, null);
						}
						if (!user || !user.active) {
							logger.debug('ICO.checkToken() (!user || !user.active). e:' + e);
							return cb(e, null);
						}
						return cb(null, true);
					});
				} else {
					logger.debug('ICO.checkToken() !isValid. e:' + e);
					return cb(e, null);
				}
			});
		} else {
			logger.debug('ICO.checkToken() accessToken===null. e:' + e);
			return cb(e, null);
		}
	});
}

/**
 * Get all ICO data from database
 *
 * @method getICO
 * @private
 * @param    {Number}   icoId The ID of the ICO database record (should be 1)
 * @callback {Function} cb    Callback function
 * @param    {Error}    err   Error information
 * @return   {Object}   ico   The ICO record from database
 */
function getICO(icoId, cb) {
	var mICO = app.models.ICO;
	var e = new Error(g.f('Record not found'));
	e.status = e.statusCode = 404;
	e.code = 'NOT_FOUND';
	mICO.findById(icoId, function(err, ico) {
		if (err) {
			logger.debug('ICO.getICO() findById() failed. err:' + err);
			return cb(err, null);
		}
		if (!ico) {
			logger.debug('ICO.getICO() ico==null. err:' + err);
			return cb(e, null);
		}
		return cb(null, ico);
	});
}


function geo2str(geo) {
	if (geo) return ' (' + geo.city + ',' + geo.region + ',' + geo.country + ')';
	return ' (localhost)';
}


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} ICO Model
 * @api public
 */
module.exports = function(ICO) {

	ICO.validatesInclusionOf('state', {in: [1, 2, 3, 4]});

	if (process.env.NODE_ENV !== undefined) {
		// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
		ICO.disableRemoteMethodByName('upsert');								// disables PATCH /ICOs
		ICO.disableRemoteMethodByName('find');									// disables GET /ICOs
		ICO.disableRemoteMethodByName('replaceOrCreate');						// disables PUT /ICOs
		ICO.disableRemoteMethodByName('create');								// disables POST /ICOs
		ICO.disableRemoteMethodByName('prototype.updateAttributes');			// disables PATCH /ICOs/{id}
		ICO.disableRemoteMethodByName('findById');								// disables GET /ICOs/{id}
		ICO.disableRemoteMethodByName('exists');								// disables HEAD /ICOs/{id}
		ICO.disableRemoteMethodByName('replaceById');							// disables PUT /ICOs/{id}
		ICO.disableRemoteMethodByName('deleteById');							// disables DELETE /ICOs/{id}
		ICO.disableRemoteMethodByName('prototype.__findById__accessTokens');	// disable GET /ICOs/{id}/accessTokens/{fk}
		ICO.disableRemoteMethodByName('prototype.__updateById__accessTokens');	// disable PUT /ICOs/{id}/accessTokens/{fk}
		ICO.disableRemoteMethodByName('prototype.__destroyById__accessTokens');	// disable DELETE /ICOs/{id}/accessTokens/{fk}
		ICO.disableRemoteMethodByName('prototype.__count__accessTokens');		// disable  GET /ICOs/{id}/accessTokens/count
		ICO.disableRemoteMethodByName('createChangeStream');					// disables POST /ICOs/change-stream
		ICO.disableRemoteMethodByName('count');									// disables GET /ICOs/count
		ICO.disableRemoteMethodByName('findOne');								// disables GET /ICOs/findOne
		ICO.disableRemoteMethodByName('update');								// disables POST /ICOs/update
		ICO.disableRemoteMethodByName('upsertWithWhere');						// disables POST /I18ns/upsertWithWhere
	}


	ICO.beforeRemote('**', function(ctx, modelInstance, next) {
		logger.info('model ' + ctx.req.method + ' \"' + ctx.req.baseUrl + ctx.req.path + '\"' + ' from: ' + ctx.req.clientIP + geo2str(ctx.req.geo));
		next();
	});


	updateAliveTimer();


	/**
	 * Get all ICO params from database
	 * Usually called by SecureSwap website
	 *
	 * @method getICOData
	 * @public
	 * @callback {Function} cb  Callback function
 	 * @param    {Error}    err Error information
	 * @return   {Object}   ico The ICO record from database
	 */
	ICO.getICOData = function(cb) {
		getICO(1, function(err, ico) {
			if (err) return cb(err, null);
			if ((+ico.state) === 2 || (+ico.state) === 3) {
				ico.wallet = config.wallet;
			}
			/*
			var received = ico.ethReceived;
			if (received.length > 0) {
				ico.updateAttributes({
					ethReceived: []
				}, function(err) {
					if (err) return cb(err, null);
					ico.ethReceived = received;
					return cb(null, ico);
				});
			} else {
				return cb(null, ico);
			}
			*/

			// ico.ethReceived conserve un array des transactions reçues depuis 10 secondes (le temps pour le client web de les récupérer)
			var past = new Date().getTime() - 10000;
			// logger.info('ICO.getICOData() previous ethReceiveds: ' + JSON.stringify(ico.ethReceived));
			// on supprime les vielles transactions
			var ethReceived = ico.ethReceived.filter(function(ethReceived) { return ethReceived.timestamp > past; });
			// logger.info('ICO.getICOData() cleaned ethReceiveds: ' + JSON.stringify(ethReceived));
			ico.updateAttributes({
				ethReceived: ethReceived
			}, function(err, instance) {
				if (err) return cb(err, null);
				return cb(null, instance);
			});

		});
	};


	/**
	 * Set all ICO params to database
	 * Usually called by secureswap node
	 *
	 * @method setParams
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {Object}   params  ICO's parameters
	 * @callback {Function} cb      Callback function
	 * @param    {Error}    err     Error information
	 */
	ICO.setParams = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (params.state)			{ if (!isInteger(params.state) || (params.state < 1 || params.state > 4))			{ logger.info('ICO.setParams() bad state: ' + params.state); return cb(e2, null); } }
		if (params.wallet)			{ if (!isString(params.wallet) || !isETHAddress(params.wallet))						{ logger.info('ICO.setParams() bad wallet: ' + params.wallet); return cb(e2, null); } }
		if (params.tokenName)		{ if (!isString(params.tokenName))													{ logger.info('ICO.setParams() bad tokenName: ' + params.tokenName); return cb(e2, null); } }
		if (params.tokenPriceUSD)	{ if (!isNumber(params.tokenPriceUSD) || params.tokenPriceUSD < 0)					{ logger.info('ICO.setParams() bad tokenPriceUSD: ' + params.tokenPriceUSD); return cb(e2, null); } }
		if (params.tokenPriceETH)	{ if (!isNumber(params.tokenPriceETH) || params.tokenPriceETH < 0)					{ logger.info('ICO.setParams() bad tokenPriceETH: ' + params.tokenPriceETH); return cb(e2, null); } }
		if (params.softCap)			{ if (!isInteger(params.softCap) || params.softCap < 0)								{ logger.info('ICO.setParams() bad softCap: ' + params.softCap); return cb(e2, null); } }
		if (params.hardCap)			{ if (!isInteger(params.hardCap) || params.hardCap < 0)								{ logger.info('ICO.setParams() bad hardCap: ' + params.hardCap); return cb(e2, null); } }
		if (params.tokensTotal)		{ if (!isInteger(params.tokensTotal) || params.tokensTotal < 0)						{ logger.info('ICO.setParams() bad tokensTotal: ' + params.tokensTotal); return cb(e2, null); } }
		if (params.ethTotal)		{ if (!isNumber(params.ethTotal) || params.ethTotal < 0)							{ logger.info('ICO.setParams() bad ethTotal: ' + params.ethTotal); return cb(e2, null); } }
		if (params.tokensSold)		{ if (!isNumber(params.tokensSold) || params.tokensSold < 0)						{ logger.info('ICO.setParams() bad tokensSold: ' + params.tokensSold); return cb(e2, null); } }
		if (params.dateStart)		{ if (!isString(params.dateStart) || !isDate(params.dateStart))						{ logger.info('ICO.setParams() bad dateStart: ' + params.dateStart); return cb(e2, null); } }
		if (params.dateEnd)			{ if (!isString(params.dateEnd) || !isDate(params.dateEnd))							{ logger.info('ICO.setParams() bad dateEnd: ' + params.dateEnd); return cb(e2, null); } }
		if (params.contractAddress)	{ if (!isString(params.contractAddress))											{ logger.info('ICO.setParams() bad contractAddress: ' + params.contractAddress); return cb(e2, null); } }
		if (params.dateStart && params.dateEnd) {
			var start = moment(params.dateStart);
			var end = moment(params.dateEnd);
			var now = moment();
			if (end.isBefore(start)) { logger.info('ICO.setParams() bad dates. dateStart:' + params.dateStart + ' dateEnd:' + params.dateEnd); return cb(e2, null); }
		}
		if (params.wallet && params.wallet !== config.wallet) {
			logger.error('ICO.setParams(): Wrong Wallet address!!! Hack attempt!!! ');
		}
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			getICO(1, function(err, ico) {
				if (err) return cb(err, null);
				ico.updateAttributes({
					state:				params.state			? params.state				: ico.state,
					wallet: 			(params.state === 2 || params.state === 3) ? config.wallet : '',
					tokenName:			params.tokenName		? params.tokenName			: ico.tokenName,
					tokenPriceUSD: 		params.tokenPriceUSD	? params.tokenPriceUSD		: ico.tokenPriceUSD,
					tokenPriceETH:		params.tokenPriceETH	? params.tokenPriceETH		: ico.tokenPriceETH,
					softCap: 			params.softCap			? params.softCap			: ico.softCap,
					hardCap:			params.hardCap			? params.hardCap			: ico.hardCap,
					tokensTotal: 		params.tokensTotal		? params.tokensTotal		: ico.tokensTotal,
					ethTotal: 			params.ethTotal			? params.ethTotal			: ico.ethTotal,
					tokensSold: 		params.tokensSold		? params.tokensSold			: ico.tokensSold,
					dateStart: 			params.dateStart		? params.dateStart			: ico.dateStart,
					dateEnd:			params.dateEnd			? params.dateEnd			: ico.dateEnd,
					contractAddress:	params.contractAddress
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
			});
		});
	};


	/**
	 * Set ICO state
	 * Usually called by secureswap node
	 *
	 * @method setState
	 * @public
	 * @param    {String}   tokenId      The token ID got from call to /login
	 * @param    {Object}   params       Parameters
	 * @param    {Number}   params.state ICO's state (1=avnt preICO, 2=preICO - 1 minute, 2=preICO, 3=preICO ended)
	 * @callback {Function} cb           Callback function
 	 * @param    {Error}    err          Error information
	 */
	ICO.setState = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = e.errorCode = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (!isInteger(params.state) || (params.state < 1 || params.state > 4))							{ logger.info('ICO.setState() bad state: ' + params.state); return cb(e2, null); }
		if (params.wallet)			{ if (!isString(params.wallet) || !isETHAddress(params.wallet))		{ logger.info('ICO.setParams() bad wallet: ' + params.wallet); return cb(e2, null); } }
		if (params.contractAddress)	{ if (!isString(params.contractAddress)) 							{ logger.info('ICO.setParams() bad contractAddress: ' + params.contractAddress); return cb(e2, null); } }
		checkToken(tokenId, function(err, granted) {
			if (err) {
				logger.debug('ICO.setState() checkToken() err:' + err);
				return cb(err, null);
			}
			if (!granted) {
				logger.debug('ICO.setState() checkToken() not granted. e:' + e);
				return cb(e, null);
			}
			getICO(1, function(err, ico) {
				if (err) {
					logger.debug('ICO.setState() getICO() failed. err:' + err);
					return cb(err, null);
				}
				ico.updateAttributes({
					state:				params.state,
					wallet: 			(params.state === 2 || params.state === 3) ? config.wallet : '',
					contractAddress:	params.contractAddress
				}, function(err, instance) {
					if (err) {
						logger.debug('ICO.setState() updateAttributes() failed. err:' + err);
						return cb(err, null);
					}
					return cb(null);
				});
			});
		});
	};


	/**
	 * Is ICO server alive?
	 * Usually called by secureswap node
	 *
	 * @method pingAlive
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {Object}   params  Dummy data
	 * @callback {Function} cb      Callback function
 	 * @param    {Error}    err     Error information
	 */
	ICO.pingAlive = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			// Server is alive
			icoServerIsAlive = true;
			icoServerIsAliveTs = moment();
			return cb(null);
		});
	};


	/**
	 * Check if the ICO server is alive
	 * Usually called by secureswap website
	 *
	 * @method isAlive
	 * @public
	 * @callback {Function} cb      Callback function
 	 * @param    {Error}    err     Error information
	 */
	ICO.isAlive = function(cb) {
		return cb(null, icoServerIsAlive);
	};


	/**
	 * Register a new purchase
	 * Usually called by secureswap node
	 *
	 * @method setReceivedEth
	 * @public
	 * @param    {String}   tokenId The token ID got from call to /login
	 * @param    {Object}   params  Purchase's parameters
	 * @callback {Function} cb      Callback function
 	 * @param    {Error}    err     Error information
	 */
	ICO.setReceivedEth = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (params.ethReceived)		{ if (!isNumber(params.ethReceived) || params.ethReceived < 0)						{ logger.info('ICO.setReceivedEth() bad ethReceived: ' + params.ethReceived); return cb(e2, null); } }
		if (params.state)			{ if (!isInteger(params.state) || (params.state < 1 || params.state > 4))			{ logger.info('ICO.setReceivedEth() bad state: ' + params.state); return cb(e2, null); } }
		if (params.tokenPriceUSD)	{ if (!isNumber(params.tokenPriceUSD) || params.tokenPriceUSD < 0)					{ logger.info('ICO.setReceivedEth() bad tokenPriceUSD: ' + params.tokenPriceUSD); return cb(e2, null); } }
		if (params.tokenPriceETH)	{ if (!isNumber(params.tokenPriceETH) || params.tokenPriceETH < 0)					{ logger.info('ICO.setReceivedEth() bad tokenPriceETH: ' + params.tokenPriceETH); return cb(e2, null); } }
		if (params.ethTotal)		{ if (!isNumber(params.ethTotal) || params.ethTotal < 0)							{ logger.info('ICO.setReceivedEth() bad ethTotal: ' + params.ethTotal); return cb(e2, null); } }
		if (params.tokensSold)		{ if (!isNumber(params.tokensSold) || params.tokensSold < 0)						{ logger.info('ICO.setReceivedEth() bad tokensSold: ' + params.tokensSold); return cb(e2, null); } }
		if (params.tokensSend)		{ if (!isNumber(params.tokensSend) || params.tokensSend < 0)						{ logger.info('ICO.setReceivedEth() bad tokensSend: ' + params.tokensSend); return cb(e2, null); } }
		if (params.discount)		{ if (!isNumber(params.discount) || params.discount < 0 || params.discount > 1.0)	{ logger.info('ICO.setReceivedEth() bad discount: ' + params.discount); return cb(e2, null); } }
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			getICO(1, function(err, ico) {
				if (err) return cb(err, null);

				// ico.ethReceived conserve un array des transactions reçues depuis 10 secondes (le temps pour le client web de les récupérer)
				var now = new Date().getTime();
				if (params.ethReceived) // on ajoute la courante
					ico.ethReceived.push({ethReceived: params.ethReceived, tokensSend: params.tokensSend, discount: params.discount, timestamp: now});

				ico.updateAttributes({
					state:			params.state			? params.state			: ico.state,
					tokenPriceUSD: 	params.tokenPriceUSD	? params.tokenPriceUSD	: ico.tokenPriceUSD,
					tokenPriceETH:	params.tokenPriceETH	? params.tokenPriceETH	: ico.tokenPriceETH,
					ethTotal: 		params.ethTotal			? params.ethTotal		: ico.ethTotal,
					tokensSold: 	params.tokensSold		? params.tokensSold		: ico.tokensSold,
					ethReceived: 	ico.ethReceived
				}, function(err, instance) {
					if (err) return cb(err, null);
					return cb(null);
				});
			});
		});
	};


	/**
	 * Check if the given string is a checksumed ETH address
	 * Usually called by secureswap website
	 *
	 * @method isChecksumAddress
	 * @public
	 * @param    {String}   address The ETH address to valid
	 * @callback {Function} cb      Callback function
 	 * @param    {Error}    err     Error information
	 */
	ICO.isChecksumAddress = function(address, cb) {
		var e = new Error(g.f('Invalid address'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_ADDRESS';
		if (!isString(address)) { logger.info('ICO.isChecksumAddress() bad address: ' + address); return cb(e, null); }
		if (isChecksumAddress(address)) {
			return cb(null, true);
		} else {
			return cb(e, false);
		}
	};


	/**
	 * Get Referrals list
	 * Usually called by website
	 *
	 * @method getReferrals
	 * @public
	 * @param    {String}   ser      Referrer Form data
	 * @callback {Function} cb       Callback function
 	 * @param    {Error}    err      Error information
	 */
	ICO.getReferrals = function(ser, cb) {
		var e = new Error(g.f('Invalid Param'));
		e.status = e.statusCode = 401;
		e.code = '0x1000';

		if (!isString(ser)) { logger.info('ICO.getReferrals() bad ser: ' + ser); e.code = '0x1001'; return cb(e, null); }
		var list = ser.split('&'); // All referrer data ({wallet: {String}referrer wallet address, email: {String[]}referrer email address})
		if (list.length < 2) { logger.info('ICO.getReferrals() bad ser: ' + ser); e.code = '0x1002'; return cb(e, null); }

		var walletad = list.filter(function(address) { return address.startsWith('wallet'); });
		var email = list.filter(function(address) { return address.startsWith('email'); });
		if (walletad.length !== 1) { logger.info('ICO.getReferrals() bad ser: ' + ser); e.code = '0x1003'; return cb(e, null); }
		if (email.length !== 1) { logger.info('ICO.getReferrals() bad ser: ' + ser); e.code = '0x1004'; return cb(e, null); }
		walletad = walletad.map(function(el) { return el.split('=').pop(); });
		walletad = walletad[0];
		email = email.map(function(el) { return el.split('=').pop(); });
		email = email[0];
		email = decodeURIComponent(email);
		if (!isETHAddress(walletad)) {
			logger.info('ICO.getReferrals() not ETH address: ' + ser);
			e.code = '0x1005';
			return cb(e, null);
		}
		request
			.post(config.icoURI + '/api/Referrers/getReferrals')
			.send({wallet: walletad})
			.timeout(5000)
			.end((err, res) => {
				if (err) {
					return cb(err);
				}
				// res.body contient {referrer: referrer, referrals: [referrals, referrals, referrals]}
				if (res.body.referrer !== walletad) {
					logger.info('ICO.getReferrals() Wrong referrer.');
					e.code = '0x1006';
					return cb(e, null);
				}
				for (var i = 0; i < res.body.referrals.length; i++) {
					if (!isETHAddress(res.body.referrals[i])) {
						logger.info('ICO.getReferrals() not ETH address: ' + res.body.referrals[i]);
						e.code = '0x1007';
						return cb(e, null);
					}
				}
				// send mail
				res.body.email = email;

				var mContact = app.models.Contact;
				mContact.referrals(res.body, function(err, res) {
					if (err) return cb(err);
					return cb(null, '');
				});
			});

	};


	/**
	 * Transmit referral wallets to ICO server for registration
	 * Usually called by website
	 *
	 * @method register
	 * @public
	 * @param    {String}   ser      Referrals Form data
	 * @callback {Function} cb       Callback function
 	 * @param    {Error}    err      Error information
	 */
	ICO.register = function(ser, cb) {
		var e = new Error(g.f('Invalid Param'));
		e.status = e.statusCode = 401;
		e.code = '0x1000';

		if (!isString(ser)) { logger.info('ICO.register() bad ser: ' + ser); return cb(e, null); }

		var list = ser.split('&'); // All referrals' wallets addresses ({referrer: {String}referrer, referrals: {String[]}referrals})
		if (list.length < 2) { logger.info('ICO.register() bad ser: ' + ser); return cb(e, null); }

		var referrer = list.filter(function(address) { return address.startsWith('referrer'); });
		var referrals = list.filter(function(address) { return address.startsWith('referral'); });
		if (referrer.length !== 1) { logger.info('ICO.register() bad ser: ' + ser); return cb(e, null); }
		if (referrals.length < 1) { logger.info('ICO.register() bad ser: ' + ser); return cb(e, null); }

		var addresses = list.map(function(el) { return el.split('=').pop(); });
		addresses = addresses.filter(function(address) { return address !== ''; });
		if (sameAddresses(addresses)) { logger.info('ICO.register() bad ser: ' + ser); return cb(e, null); }

		referrer = referrer.map(function(el) { return el.split('=').pop(); });
		referrer = referrer[0];
		referrals = referrals.map(function(el) { return el.split('=').pop(); });
		referrals = referrals.filter(function(address) { return address !== ''; });

		if (!isETHAddress(referrer)) {
			logger.info('ICO.register() not ETH address: ' + ser);
			return cb(e, null);
		}
		for (var i = 0; i < referrals.length; i++) {
			if (!isETHAddress(referrals[i])) {
				logger.info('ICO.register() not ETH address: ' + ser);
				return cb(e, null);
			}
		}

		request
			.post(config.icoURI + '/api/Referrers/register')
			.send({wallets: {referrer: referrer, referrals: referrals}})
			.timeout(5000)
			.end((err, res) => {
				if (err) return cb(err);
				return cb(null, '');
			});
	};

};
