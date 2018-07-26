'use strict';

var path	= require('path');
var async	= require('async');
//var moment	= require('moment');
var debug	= require('debug')('ss_ico:ico');
var config	= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var g		= require('../../node_modules/loopback/lib/globalize');
var app		= require('../../server/server');

function checkToken(tokenId, cb) {
	var mAdmin = app.models.Admin;
	var mAccessToken = app.models.AccessToken;
	mAccessToken.findById(tokenId, function(err, accessToken) {
		if (err) {
			cb(err, null);
		} else if (accessToken) {
			mAdmin.findById(accessToken.userId, function(err, user) {
				if (err) return cb(err, null);
				if (user) {
					if (!user.active) {
						err = new Error(g.f('User not active. userId {{userId}}'));
						err.status = 404;
						return cb(err, null);
					}
					return cb(null, user);
				} else {
					err = new Error(g.f('Could not find userId {{userId}}'));
					err.status = 404;
					return cb(err, null);
				}
			});
		} else {
			err = new Error(g.f('identification failed'));
			err.status = 401;
			cb(err, null);
		}
	});
}


module.exports = function(ICO) {
	
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


	ICO.getICOData = function(cb) {
		ICO.findById(1, function(err, ico) {
			if (err) return cb(err, null);
			if (ico === null) {
				err = new Error(g.f('Can\'t find ICO'));
				err.status = 404;
				return cb(err, null);
			}
			process.nextTick(function() {
				cb(null, ico);
			});
		});
	};

	ICO.setParams = function(tokenId, params, cb) {
		checkToken(tokenId, function(err, user) {
			if (err) return cb(err, null);
			ICO.findById(1, function(err, ico) {
				if (err) return cb(err, null);
				if (ico === null) {
					err = new Error(g.f('Can\'t find ICO'));
					err.status = 404;
					return cb(err, null);
				}
				ico.updateAttributes({
					wallet: 		params.wallet,
					tokenName:		params.tokenName,
					tokenPriceUSD: 	params.tokenPriceUSD,
					tokenPriceETH:	params.tokenPriceETH,
					softCap: 		params.softCap,
					hardCap:		params.hardCap,
					tokensTotal: 	params.tokensTotal,
					ethTotal: 		params.ethTotal, 
					tokensSold: 	params.tokensSold,
					dateStart: 		params.dateStart,
					dateEnd:		params.dateEnd
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null, 'ok');
				});
			});
		});
	};

	ICO.setReceivedEth = function(tokenId, params, cb) {
		checkToken(tokenId, function(err, user) {
			if (err) return cb(err, null);

			// update popup message
			//
			//	-        Nombre d’ethereum total reçu
			//	-        Nombre de Token total vendu
			//
			ICO.findById(1, function(err, ico) {
				if (err) return cb(err, null);
				if (ico === null) {
					err = new Error(g.f('Can\'t find ICO'));
					err.status = 404;
					return cb(err, null);
				}
				ico.updateAttributes({
					ethReceived: 	params.ethReceived,
					ethTotal:	 	params.ethTotal,
					tokensSold: 	params.tokensSold
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null, 'ok');
				});
			});
		});
	};

	ICO.getPurchase = function(cb) {
		ICO.findById(1, function(err, ico) {
			if (err) return cb(err, null);
			if (ico === null) {
				err = new Error(g.f('Can\'t find ICO'));
				err.status = 404;
				return cb(err, null);
			}
			var received = ico.ethReceived;
			if (received > 0) {
				ico.updateAttributes({
					ethReceived: 0
				}, function(err) {
					if (err) return cb(err, null);
					return cb(null, {
						ethReceived: 	ico.ethReceived,
						ethTotal:	 	ico.ethTotal,
						tokensSold: 	ico.tokensSold
					});
				});
			} else {
				return cb(null, null);
			}
		});
	};

};
