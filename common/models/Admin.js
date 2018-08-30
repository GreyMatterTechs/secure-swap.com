/**
 * Module for Admin database table related features.
 *
 * @module Admin
 * @file   This file defines the Admin module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path = require('path');
const async = require('async');
const passGen = require('password-generator');
const uuidV1 = require('uuid/v1');
const g = reqlocal(path.join('node_modules', 'loopback', 'lib', 'globalize'));
const loopback = reqlocal(path.join('node_modules', 'loopback', 'lib', 'loopback'));
const utils = reqlocal(path.join('node_modules', 'loopback', 'lib', 'utils'));
const config = reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger = reqlocal(path.join('server', 'boot', 'winston.js')).logger;

// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var bcrypt;
try {
	// Try the native module first
	bcrypt = require('bcrypt');
	// Browserify returns an empty object
	if (bcrypt && typeof bcrypt.compare !== 'function') {
		bcrypt = require('bcryptjs');
	}
} catch (err) {
	// Fall back to pure JS impl
	bcrypt = require('bcryptjs');
}

const SALT_WORK_FACTOR = 10;
const MAX_PASSWORD_LENGTH = 72;
const HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
const MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 30;
const YEAR_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 365;


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

/*
function makeOptions() {
	var options = {};
	options.type = 'email';
	options.protocol = 'http';
	options.host = config.nginxhost;	// (app && app.get('host')) || 'localhost';
	options.port = config.nginxport;	// (app && app.get('port')) || 3000;
	options.displayPort = (
		(options.protocol === 'http' && options.port == '80') ||
		(options.protocol === 'https' && options.port == '443')
	) ? '' : ':' + options.port;
	options.from = config.mailProvider.auth.user;
	// options.redirect= '/verified';
	options.appName = config.appName;
	options.headers = options.headers || {};
	return options;
}
*/

/*
function createTemplatedEmailBody(options, cb) {
	var template = loopback.template(options.template);
	var body = template(options);
	cb(null, body);
}
*/

function getUser(tokenId, thisUser, cb) {
	thisUser.relations.accessTokens.modelTo.findById(tokenId, function(err, accessToken) {
		if (err) {
			cb(err, null);
		} else if (accessToken) {
			thisUser.findById(accessToken.userId, function(err, user) {
				if (err) {
					logger.error('An error is reported from User.findById: ' + err);
					cb(err, null);
				} else if (user) {
					cb(null, user, accessToken);
				} else {
					var err2 = new Error(g.f('getUser failed'));
					err2.statusCode = 401;
					err2.code = 'GET_USER_FAILED';
					logger.error('No matching record is found for user ' + accessToken.userId);
					cb(err2, null);
				}
			});
		} else {
			var err2 = new Error(g.f('identification failed'));
			err2.statusCode = 401;
			err2.code = 'IDENTIFICATION_FAILED';
			logger.error('An error is reported from AccessTokens.findById: ' + err2);
			cb(err2, null);
		}
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
 * @param {Object} Admin Model
 * @api public
 */
module.exports = function(Admin) {

	Admin.validatesInclusionOf('onlineStatus', {in: ['online', 'away', 'offline']});

	if (process.env.NODE_ENV !== undefined) {
		// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
		Admin.disableRemoteMethodByName('upsert');                               // disables PATCH /Admins
		Admin.disableRemoteMethodByName('find');                                 // disables GET /Admins
		Admin.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /Admins
		Admin.disableRemoteMethodByName('create');                               // disables POST /Admins

		Admin.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /Admins/{id}
		Admin.disableRemoteMethodByName('findById');                             // disables GET /Admins/{id}
		Admin.disableRemoteMethodByName('exists');                               // disables HEAD /Admins/{id}
		Admin.disableRemoteMethodByName('replaceById');                          // disables PUT /Admins/{id}
		Admin.disableRemoteMethodByName('deleteById');                           // disables DELETE /Admins/{id}

		Admin.disableRemoteMethodByName('prototype.__get__accessTokens');        // disable GET /Admins/{id}/accessTokens
		Admin.disableRemoteMethodByName('prototype.__create__accessTokens');     // disable POST /Admins/{id}/accessTokens
		Admin.disableRemoteMethodByName('prototype.__delete__accessTokens');     // disable DELETE /Admins/{id}/accessTokens

		Admin.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Admins/{id}/accessTokens/{fk}
		Admin.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Admins/{id}/accessTokens/{fk}
		Admin.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Admins/{id}/accessTokens/{fk}

		Admin.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Admins/{id}/accessTokens/count

		Admin.disableRemoteMethodByName('prototype.verify');                     // disable POST /Admins/{id}/verify
		Admin.disableRemoteMethodByName('changePassword');                       // disable POST /Admins/change-password
		Admin.disableRemoteMethodByName('createChangeStream');                   // disable GET and POST /Admins/change-stream

		Admin.disableRemoteMethodByName('confirm');                              // disables GET /Admins/confirm
		Admin.disableRemoteMethodByName('count');                                // disables GET /Admins/count
		Admin.disableRemoteMethodByName('findOne');                              // disables GET /Admins/findOne

		//Admin.disableRemoteMethodByName('login');                                // disables POST /Admins/login
		//Admin.disableRemoteMethodByName('logout');                               // disables POST /Admins/logout

		Admin.disableRemoteMethodByName('resetPassword');                        // disables POST /Admins/reset
		Admin.disableRemoteMethodByName('setPassword');                          // disables POST /Admins/reset-password
		Admin.disableRemoteMethodByName('update');                               // disables POST /Admins/update
		Admin.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Admins/upsertWithWhere
	}


	Admin.beforeRemote('**', function(ctx, modelInstance, next) {
		logger.info('model ' + ctx.req.method + ' \"' + ctx.req.baseUrl + ctx.req.path + '\"' + ' from: ' + ctx.req.clientIP + geo2str(ctx.req.geo) + ' [' + ctx.req.username + ']');
		next();
	});


	Admin.setOnlineStatus = function(accessToken, status, cb) {
		Admin.findById(accessToken.userId, function(err, user) {
			if (err && (typeof cb === 'function')) return cb(err, null);
			if (user) {
				user.updateAttributes({
					dateLastVisit: new Date().getTime(),
					onlineStatus: status
				}, function(err, user) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (typeof cb === 'function') return cb(null, user);
				});
			} else {
				err = new Error(g.f('Could not find userId {{accessToken.userId}}'));
				err.status = 404;
				if (typeof cb === 'function') return cb(err, null);
			}
		});
	};

	Admin.setOnlineStatusById = function(userId, status, cb) {
		Admin.findById(userId, function(err, user) {
			if (err && (typeof cb === 'function')) return cb(err, null);
			if (user) {
				user.updateAttributes({
					dateLastVisit: new Date().getTime(),
					onlineStatus: status
				}, function(err) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (typeof cb === 'function') return cb(null, user);
				});
			} else {
				err = new Error(g.f('Could not find userId {{userId}}'));
				err.status = 404;
				if (typeof cb === 'function') return cb(err, null);
			}
		});
	};

	Admin.setOnlineStatusByTokenId = function(tokenId, status, cb) {
		var mAccessToken = Admin.app.models.AccessToken;
		mAccessToken.findById(tokenId, function(err, accessToken) {
			if (err) {
				cb(err, null);
			} else if (accessToken) {
				Admin.findById(accessToken.userId, function(err, user) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (user) {
						user.updateAttributes({
							dateLastVisit: new Date().getTime(),
							onlineStatus: status
						}, function(err) {
							if (err && (typeof cb === 'function')) return cb(err, null);
							if (typeof cb === 'function') return cb(null, user);
						});
					} else {
						err = new Error(g.f('Could not find userId {{userId}}'));
						err.status = 404;
						if (typeof cb === 'function') return cb(err, null);
					}
				});
			} else {
				err = new Error(g.f('identification failed'));
				err.statusCode = 401;
				err.code = 'IDENTIFICATION_FAILED';
				logger.error('An error is reported from setOnlineStatusByTokenId: ' + err);
				cb(err, null);
			}
		});
	}

	Admin.getOnlineStatus = function(userId, cb) {
		Admin.findById(userId, function(err, user) {
			if (err) cb(err, null);
			if (user) {
				var status = user.onlineStatus;
				if (status === 'online') {
					if (user.dateLastVisit) {
						var dateLastVisit = new Date(user.dateLastVisit).getTime();
						var now = new Date().getTime();
						if (now > dateLastVisit + 1000 * 60)
							status = 'away';
					}
				}
				cb(null, status);
			} else {
				cb(null, 'offline');
			}
		});
	};


	Admin.getOnlineStatuses = function(tokenId, userId, fn) {
		fn = fn || utils.createPromiseCallback();
		var err;
	/*	if (!tokenId) {
			err = new Error(g.f('{{tokenId}} is required to get Online Statuses'));
			err.status = 401;
			process.nextTick(fn, err);
			return fn.promise;
		}
	*/	if (!userId) {
			err = new Error(g.f('{{userId}} is required to get Online Statuses'));
			err.status = 400;
			process.nextTick(fn, err);
			return fn.promise;
		}
		Admin.find({}, function(err, users) {
			if (err) return fn(err);
			var statuses = {};
			var now = new Date().getTime();
			users.forEach(function(user) {
				var status = user.onlineStatus;
				if (status === 'online') {
					if (user.dateLastVisit) {
						var dateLastVisit = new Date(user.dateLastVisit).getTime();
						if (now > dateLastVisit + 1000 * 60) status = 'away';
					}
				}
				statuses[user.id] = status;
			});
			fn(null, statuses);
		});
		return fn.promise;
	};

	Admin.remoteMethod('getOnlineStatuses', {
		description: 'Reports online status of this user',
		accepts: [
			{
				arg: 'access_token', type: 'string', http: function(ctx) {
					var req = ctx && ctx.req;
					var accessToken = req && req.accessToken;
					var tokenID = accessToken ? accessToken.id : undefined;
					return tokenID;
				},
				description: 'Do not supply this argument, it is automatically extracted from request headers.'
			},
			{ arg: 'userId', type: 'string', required: true, description: 'id of user' }
		],
		returns: { arg: 'statuses', type: 'object', root: true },
		http: { verb: 'POST' }
	});


	Admin.setActive = function(tokenId, userId, active, fn) {
		fn = fn || utils.createPromiseCallback();
		var err;
		if (!tokenId) {
			err = new Error(g.f('{{accessTokens}} is required to set setActive'));
			err.status = 401;
			process.nextTick(fn, err);
			return fn.promise;
		}
		var self = this;
		getUser(tokenId, self, function(err, user, accessToken) {
			if (err) {
				logger.error('An error is reported from getUser: ' + err);
				fn(err, null);
			} else if (user) { // <= the admin who sent the command

				Admin.setOnlineStatus(accessToken, 'online');

				Admin.findById(userId, function(err, user) { // <= the customer who has the active state changed
					if (err) {
						logger.error('An error is reported from setActive: ' + err);
						fn(err, null);
					} else {
						if (user) {
							var firstActivation = false;
							if (active && !user.accessVerified) {	// le gars n'est pas un VIP et c'est sa 1ere activation
								firstActivation = true;
								user.updateAttributes({ accessVerified: true });
								/*
								var options = makeOptions();
								options.template = path.resolve(__dirname, '../../server/views/accountActivated_email.ejs');
								options.to = user.email;
								options.subject = '[' + config.appName + '] Activation de votre compte';
								options.firstname = user.prenom;
								options.verifyHref = options.protocol + '://' + options.host + options.displayPort + '/';
								createTemplatedEmailBody(options, function(err, html) {
									if (err) {
										//return fn(err, null);	   SI l'envoi du mail foire, ben ... tanpis... l'activation du compte continue quand même...
									} else {
										options.html = html;
										delete options.template;		// Remove options.template to prevent rejection by certain nodemailer transport plugins.
										User.app.models.Email.send(options);
									}
								});
								*/
							}

							user.updateAttributes({
								active: active
							}, function(err, user) {
								if (err) {
									logger.error('An error is reported from setActive: ' + err);
									fn(err, null);
								} else {
									var mClient = User.app.models.Client;
									mClient.updateAll({ userId: user.id }, { active: active }, function(err, info) {
										if (err) {
											logger.error('An error is reported from setActive.updateAll: ' + err);
											fn(err, null);
										} else {
											user.firstActivation = firstActivation;
											fn(null, user);
										}
									});
								}
							});
						} else {
							err = new Error(g.f('Unknown user: %s', userId));
							err.code = 'UNKNOWN_USER';
							err.statusCode = 422;
							logger.error('An error is reported from setActive: ' + err);
							fn(err, null);
						}
					}
				});
			} else {
				var err2 = new Error(g.f('identification failed'));
				err2.statusCode = 401;
				err2.code = 'IDENTIFICATION_FAILED';
				logger.error('An error is reported from getSessions: ' + err);
				fn(err2, null);
			}
		});
		return fn.promise;
	};
	Admin.remoteMethod('setActive', {
		description: 'Set account\'s active state',
		accepts: [
			{
				arg: 'access_token', type: 'string', http: function(ctx) {
					var req = ctx && ctx.req;
					var accessToken = req && req.accessToken;
					var tokenID = accessToken ? accessToken.id : undefined;
					return tokenID;
				},
				description: 'Do not supply this argument, it is automatically extracted from request headers.'
			},
			{ arg: 'userId', type: 'string', required: true, description: 'id of user to set active state' },
			{ arg: 'active', type: 'boolean', required: true, description: 'the state' }
		],
		returns: {
			arg: 'user', type: 'object', root: true
		},
		http: { verb: 'POST' }
	});


};
