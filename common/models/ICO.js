'use strict';

var path	= require('path');
var async	= require('async');
//var moment	= require('moment');
var debug	= require('debug')('ss_ico:ico');
var config	= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


module.exports = function(ICO) {
	
	//var mUser = Purchase.app.models.User;

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


	ICO.SetStartDateTime = function(date, cb) {
		
		
		process.nextTick(function() {
			cb(err, null);
		});		
	};
	
	ICO.GetStartDateTime = function(cb) {
		
		//var date = moment.utc();
		//get startdate from database
		ICO.findById(1, function(err, ico) {
			var date = null;
			if (err) {
				debug('An error is reported from ICO.findById: %j', err);
			} else {
				date = ico.start;
			}
			process.nextTick(function() {
				cb(err, date);	// in seconds from now
			});	
		});	
	};
	

	ICO.GetICOData = function(cb) {
		ICO.findById(1, function(err, ico) {
			if (err) {
				debug('An error is reported from ICO.findById: %j', err);
			}
			process.nextTick(function() {
				cb(err, ico);	
			});	
		});	
	};

/*
	ICO.setParams = function(cb) {
		if (!req.body)
			return res.send({ err: 400 });
		if (!req.body.username && !req.body.password) 
			return res.send({ err: 401 });
		mAdmin.login({ username: req.body.username, password: req.body.password, ttl: ONE_MINUTE }, 'user', function(err, token) {
			if (err) 
				return res.send({ err: err.statusCode });
			mAdmin.findById(token.userId, function(err, user) {
				if (err) {
					mAdmin.logout(token.id);
					return res.send({ err: err.statusCode });
				} else {
					if (user) {
						if (!user.active) {
							mAdmin.logout(token.id);
							return res.send({ err: 401 });
						} else {
							mICO.findById(1, function(err, ico) {
								if (err) return res.send({ err: 401 });
								if (ico === null) return res.send({ err: 401 });
								ico.update({
									wallet: 		req.body.wallet,
									tokenName:		req.body.tokenName,
									tokenPriceUSD: 	req.body.tokenPriceUSD,
									tokenPriceETH:	req.body.tokenPriceETH,
									softCap: 		req.body.softCap,
									hardCap:		req.body.hardCap,
									tokensTotal: 	req.body.tokensTotal,
									ethReceived: 	req.body.ethReceived, 
									tokensSold: 	req.body.tokensSold,
									dateStart: 		req.body.dateStart,
									dateEnd:		req.body.dateEnd
								}, function(err, ico) {
									if (err) return res.send({ err: 401 });
									return res.send('ok');
								});
							});
						}
					} else {
						return res.send({ err: 401 });
					}
				}
			});
		});
	});

	router.post('receivedEth', urlencodedParser, function(req, res) {
		if (!req.body)
			return res.send({ err: 400 });
		if (!req.body.username && !req.body.password) 
			return res.send({ err: 401 });
		mAdmin.login({ username: req.body.username, password: req.body.password, ttl: ONE_MINUTE }, 'user', function(err, token) {
			if (err) 
				return res.send({ err: err.statusCode });
			mAdmin.findById(token.userId, function(err, user) {
				if (err) {
					mAdmin.logout(token.id);
					return res.send({ err: err.statusCode });
				} else {
					if (user) {
						if (!user.active) {
							mAdmin.logout(token.id);
							return res.send({ err: 401 });
						} else {							
							// update popup message
							//
							//	-        Nombre d’ethereum total reçu
							//	-        Nombre de Token total vendu														
							//
							return res.send('ok');
						}
					} else {
						return res.send({ err: 401 });
					}
				}
			});
		});
	});

	router.post('hardCapReached', urlencodedParser, function(req, res) {
		if (!req.body)
			return res.send({ err: 400 });
		if (!req.body.username && !req.body.password) 
			return res.send({ err: 401 });
		mAdmin.login({ username: req.body.username, password: req.body.password, ttl: ONE_MINUTE }, 'user', function(err, token) {
			if (err) 
				return res.send({ err: err.statusCode });
			mAdmin.findById(token.userId, function(err, user) {
				if (err) {
					mAdmin.logout(token.id);
					return res.send({ err: err.statusCode });
				} else {
					if (user) {
						if (!user.active) {
							mAdmin.logout(token.id);
							return res.send({ err: 401 });
						} else {							
							// annoncer la fin de l'ICO
							//
							//	-        Nombre total d’ethereum reçu
							//	-        Nombre total de token vendus (On ne doit plus afficher l’information du wallet d’envois et on doit signaler que l’ICO est terminée).													
							//
							return res.send('ok');
						}
					} else {
						return res.send({ err: 401 });
					}
				}
			});
		});
	});
	*/



};
