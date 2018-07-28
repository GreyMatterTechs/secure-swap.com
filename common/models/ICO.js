'use strict';

var path		= require('path');
var debug		= require('debug')('ss_ico:ico');
var config		= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var g			= require('../../node_modules/loopback/lib/globalize');
var app			= require('../../server/server');
var CryptoJS	= require('crypto-js');
var sha3		= require('crypto-js/sha3');

/**
 * Checks if the given string is an ETH address
 *
 * @method isETHAddress
 * @private
 * @param {String} address the given HEX adress
 * @return {Boolean}
*/
function isETHAddress(address) {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) { // check if it has the basic requirements of an address
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) { // If it's all small caps or all all caps, return true
		return true;
	} else { // Otherwise check each case
		return isChecksumAddress(address);
	}
};

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @private
 * @param {String} address the given HEX adress
 * @return {Boolean}
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
};

/**
 * Check if val is a Number
 *
 * @method isNumber
 * @private
 * @param {String} val
 * @return {Boolean} true if the val is a Number
 */
function isNumber(val) {
	return isFloat(val) || isInteger(val);
}

/**
 * Check if val is a Float
 *
 * @method isFloat
 * @private
 * @param {String} val
 * @return {Boolean} true if the val is a Float
 */
function isFloat(val) {
	return !isNaN(val) && val.toString().indexOf('.') !== -1;
}

/**
 * Check if val is an Interger
 *
 * @method isInteger
 * @private
 * @param {String} val
 * @return {Boolean} true if the val is an Integer
 */
function isInteger(val) {
	return !isNaN(val) && val.toString().indexOf('.') === -1;
}

/**
 * Check if val is a String
 *
 * @method isString
 * @private
 * @param {String} val
 * @return {Boolean} true if the val is a String
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
 * @param {String} val
 * @return {Boolean} true if the val is a Date
 */
function isDate(val) {
	return Object.prototype.toString.call(val) === '[object Date]';
}

/**
 * Check access token validity
 *
 * @method checkToken
 * @private
 * @param {String} tokenId token id got from call to /login
 * @callback {Function} cb Callback function
 * @param {Error} err Error information
 * @param {Boolean} granted if true, access token granted
 */
function checkToken(tokenId, cb) {
	var mAdmin = app.models.Admin;
	var mAccessToken = app.models.AccessToken;
	var e = new Error(g.f('Invalid Access Token'));
	e.status = e.statusCode = 401;
	e.code = 'INVALID_TOKEN';
	mAccessToken.findById(tokenId, function(err, accessToken) {
		if (err) return cb(err, null);
		if (accessToken) {
			accessToken.validate(function(err, isValid) {	// check user ACL and token TTL
				if (err) {
					return cb(err, null);
				} else if (isValid) {
					mAdmin.findById(accessToken.userId, function(err, user) {	// check if user is active
						if (err) return cb(err, null);
						if (!user || !user.active) {
							return cb(e, null);
						}
						return cb(null, true);
					});
				} else {
					return cb(e, null);
				}
			});
		} else {
			return cb(e, null);
		}
	});
}

/**
 * Get all ICO data from database
 *
 * @method getICO
 * @private
 * @param {Number} icoId id of the ICO database record (should be 1)
 * @callback {Function} cb Callback function
 * @param {Error} err Error information
 * @return {Object} ico ICO record from database
 */
function getICO(icoId, cb) {
	var mICO = app.models.ICO;
	var e = new Error(g.f('Record not found'));
	e.status = e.statusCode = 404;
	e.code = 'NOT_FOUND';
	mICO.findById(icoId, function(err, ico) {
		if (err) return cb(err, null);
		if (!ico) return cb(e, null);
		return cb(null, ico);
	});
}


module.exports = function(ICO) {

	ICO.validatesInclusionOf('state', {in: [1, 2, 3]});

	// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
	ICO.disableRemoteMethodByName('upsert');                               // disables PATCH /ICOs
	ICO.disableRemoteMethodByName('find');                                 // disables GET /ICOs
	ICO.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /ICOs
	ICO.disableRemoteMethodByName('create');                               // disables POST /ICOs
	ICO.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /ICOs/{id}
	ICO.disableRemoteMethodByName('findById');                             // disables GET /ICOs/{id}
	ICO.disableRemoteMethodByName('exists');                               // disables HEAD /ICOs/{id}
	ICO.disableRemoteMethodByName('replaceById');                          // disables PUT /ICOs/{id}
	ICO.disableRemoteMethodByName('deleteById');                           // disables DELETE /ICOs/{id}
	ICO.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /ICOs/{id}/accessTokens/{fk}
	ICO.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /ICOs/{id}/accessTokens/{fk}
	ICO.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /ICOs/{id}/accessTokens/{fk}
	ICO.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /ICOs/{id}/accessTokens/count
	ICO.disableRemoteMethodByName('count');                                // disables GET /ICOs/count
	ICO.disableRemoteMethodByName('findOne');                              // disables GET /ICOs/findOne
	ICO.disableRemoteMethodByName('update');                               // disables POST /ICOs/update
	ICO.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /I18ns/upsertWithWhere

	/**
	 * Get all ICO params from database
	 * Usually called by SecureSwap website
	 *
	 * @method getICOData
	 * @public
	 * @callback {Function} cb Callback function
 	 * @param {Error} err Error information
 	 * @return {Object} ico ICO record from database
	 */
	ICO.getICOData = function(cb) {
		getICO(1, function(err, ico) {
			if (err) return cb(err, null);
			return cb(null, ico);
		});
	};

	/**
	 * Check if a purchase just happend
	 * Usually called by SecureSwap website
	 *
	 * @method getPurchase
	 * @public
	 * @callback {Function} cb Callback function
 	 * @param {Error} err Error information
	 * @return {Object} purchase data
	 */
	ICO.getPurchase = function(cb) {
		getICO(1, function(err, ico) {
			if (err) return cb(err, null);
			var received = ico.ethReceived;
			if (received > 0) {
				ico.updateAttributes({
					ethReceived: 0
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null, {
						state:			ico.state,
						ethReceived: 	received,
						ethTotal:	 	ico.ethTotal,
						tokensSold: 	ico.tokensSold
					});
				});
			} else {
				return cb(null, null);
			}
		});
	};


	/**
	 * Set all ICO params to database
	 * Usually called by secureswap node
	 *
	 * @method setParams
	 * @public
	 * @param {String} tokenId token id got from call to /login
	 * @param {Object} params ICO's parameters
	 * @callback {Function} cb Callback function
 	 * @param {Error} err Error information
	 */
	ICO.setParams = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (params.state)			{ if (!isInteger(params.state) || (params.state < 1 || params.state > 3))	return cb(e2, null); }
		if (params.wallet)			{ if (!isString(params.wallet) || !isETHAddress(params.wallet))				return cb(e2, null); }
		if (params.tokenName)		{ if (!isString(params.tokenName))											return cb(e2, null); }
		if (params.tokenPriceUSD)	{ if (!isNumber(params.tokenPriceUSD) || params.tokenPriceUSD < 0)			return cb(e2, null); }
		if (params.tokenPriceETH)	{ if (!isNumber(params.tokenPriceETH) || params.tokenPriceETH < 0)			return cb(e2, null); }
		if (params.softCap)			{ if (!isInteger(params.softCap) || params.softCap < 0)						return cb(e2, null); }
		if (params.hardCap)			{ if (!isInteger(params.hardCap) || params.hardCap < 0)						return cb(e2, null); }
		if (params.tokensTotal)		{ if (!isInteger(params.tokensTotal) || params.tokensTotal < 0)				return cb(e2, null); }
		if (params.ethTotal)		{ if (!isNumber(params.ethTotal) || params.ethTotal < 0)					return cb(e2, null); }
		if (params.tokensSold)		{ if (!isNumber(params.tokensSold) || params.tokensSold < 0)				return cb(e2, null); }
		if (params.dateStart)		{ if (!isDate(params.dateStart))											return cb(e2, null); }
		if (params.dateEnd)			{ if (!isDate(params.dateEnd))												return cb(e2, null); }
		if (params.dateStart && params.dateEnd) {
			if (params.dateStart > params.dateEnd) return cb(e2, null);
			if (params.dateStart < Date.now()) return cb(e2, null);
			if (params.dateStart < Date.now()) return cb(e2, null);
		}
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			getICO(1, function(err, ico) {
				if (err) return cb(err, null);
				ico.updateAttributes({
					state:			params.state			? params.state			: ico.state,
					wallet: 		params.wallet			? params.wallet			: ico.wallet,
					tokenName:		params.tokenName		? params.tokenName		: ico.tokenName,
					tokenPriceUSD: 	params.tokenPriceUSD	? params.tokenPriceUSD	: ico.tokenPriceUSD,
					tokenPriceETH:	params.tokenPriceETH	? params.tokenPriceETH	: ico.tokenPriceETH,
					softCap: 		params.softCap			? params.softCap		: ico.softCap,
					hardCap:		params.hardCap			? params.hardCap		: ico.hardCap,
					tokensTotal: 	params.tokensTotal		? params.tokensTotal	: ico.tokensTotal,
					ethTotal: 		params.ethTotal			? params.ethTotal		: ico.ethTotal,
					tokensSold: 	params.tokensSold		? params.tokensSold		: ico.tokensSold,
					dateStart: 		params.dateStart		? params.dateStart		: ico.dateStart,
					dateEnd:		params.dateEnd			? params.dateEnd		: ico.dateEnd
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
	 * @param {String} tokenId token id got from call to /login
	 * @param {Number} state ICO's state (1=preICO, 2=ICO, 3=ICO ended)
	 * @callback {Function} cb Callback function
 	 * @param {Error} err Error information
	 */
	ICO.setState = function(tokenId, state, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (!isInteger(state) || (state < 1 || state > 3))	return cb(e2, null);
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			getICO(1, function(err, ico) {
				if (err) return cb(err, null);
				ico.updateAttributes({
					state: state
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
			});
		});
	};

	/**
	 * Register a new purchase
	 * Usually called by secureswap node
	 *
	 * @method setReceivedEth
	 * @public
	 * @param {String} tokenId token id got from call to /login
	 * @param {Object} params Purchase's parameters
	 * @callback {Function} cb Callback function
 	 * @param {Error} err Error information
	 */
	ICO.setReceivedEth = function(tokenId, params, cb) {
		var e = new Error(g.f('Invalid Access Token'));
		e.status = e.statusCode = 401;
		e.code = 'INVALID_TOKEN';
		var e2 = new Error(g.f('Invalid Param'));
		e2.status = e2.statusCode = 401;
		e2.code = 'INVALID_PARAM';
		if (params.state)			{ if (!isInteger(params.state) || (params.state < 1 || params.state > 3))	return cb(e2, null); }
		if (params.ethReceived)		{ if (!isNumber(params.ethReceived) || params.ethReceived < 0)				return cb(e2, null); }
		if (params.ethTotal)		{ if (!isNumber(params.ethTotal) || params.ethTotal < 0)					return cb(e2, null); }
		if (params.tokensSold)		{ if (!isNumber(params.tokensSold) || params.tokensSold < 0)				return cb(e2, null); }
		checkToken(tokenId, function(err, granted) {
			if (err) return cb(err, null);
			if (!granted) return cb(e, null);
			getICO(1, function(err, ico) {
				if (err) return cb(err, null);
				ico.updateAttributes({
					state:			params.state,
					ethReceived: 	params.ethReceived,
					ethTotal:	 	params.ethTotal,
					tokensSold: 	params.tokensSold
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
			});
		});
	};

};
