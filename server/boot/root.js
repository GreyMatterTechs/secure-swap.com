/**
 * Module for HTTP requests routing.
 *
 * @module root
 * @file   This file defines the root module.
 *
 * @author Philippe Aubessard
 * Copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const requestIp	= require('request-ip');
const geoip		= require('geoip-lite');
const g			= reqlocal(path.join('node_modules', 'loopback', 'lib', 'globalize'));
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;

// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

const ONE_HOUR		= 60 * 60;
const ONE_MINUTE	= 60;
var mAdmin;
var mContact;
var mAccessToken;


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

/**
 * Check if val is a String
 *
 * @method isString
 * @private
 * @param   {*}       val The string to check
 *
 * @returns {Boolean} True if val is a String
 */
function isString(val) {
	return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
}

/**
 * Shorten a String and add '...'
 *
 * @method shorten
 * @private
 * @param   {String} str     The String to shorten
 * @param   {Number} [len=5] Optional. Max length
 *
 * @returns {String} The shortened string
 */
function shorten(str, len) {
	if (isString(str)) {
		len = (typeof len === 'number') ? len : 5;
		if (str.length > len) {
			var deb = str.substring(0, len);
			return deb + '\u2026';
		}
		return str;
	} else {
		return str;
	}
}

/**
 * Log a user
 *
 * @method login
 * @private
 * @param    {Object}   req   Received HTTP request
 * @callback {Function} cb    Callback function
 * @param    {Error}    err   Error information
 * @param    {String}   id    Token ID of logged in user
 * @param    {String[]} roles Roles of the logged in user
 */
function login(req, cb) {
	if (!req.body) {
		return cb(403, null);
	}
	if (!req.body.username && !req.body.password) {
		return cb(403, null);
	}
	mAdmin.login({
		username: req.body.username,
		password: req.body.password,
		ttl: config.loginTTL === 'hour' ? ONE_HOUR : (config.loginTTL === 'minute' ? ONE_MINUTE : (ONE_MINUTE))
	}, 'user', function(err, token) {
		if (err) {
			return cb(err.statusCode, null);
		}
		if (token.user) {
			token.user(function(err, user) {
				if (err) {
					return cb(err.statusCode, token.id);
				}
				if (!user.active) {
					mAdmin.logout(token.id);
					return cb(err.statusCode, token.id);
				} else {
					return cb(null, token.id, user.roles);
				}
			});
		} else {
			return cb(403, token.id);
		}
	});
}


/**
 * Check access token validity
 *
 * @method checkToken
 * @private
 * @param    {String}   tokenId The token ID got from call to /login
 * @callback {Function} cb      Callback function
 * @param    {Error}    err     Error information
 * @param    {Object}   user    Granted user
 */
function checkToken(tokenId, cb) {
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
						return cb(null, user);
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
 * Log a user
 *
 * @method getUser
 * @private
 * @param    {Object}   req   Received HTTP request
 * @callback {Function} cb    Callback function
 * @param    {Error}    err   Error information
 * @param    {String[]} roles Roles of the logged in user
 */
function getUser(req, cb) {
	if (!req.query.access_token && !req.accessToken) {
		return cb(403, null);
	}
	var token = req.query.access_token || req.accessToken;
	checkToken(token.id, function(err, user) {
		if (err) return cb(err, null);
		return cb(null, user.roles);
	});
}


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} server Express App
 * @api public
 */
module.exports = function(server) {
	server.locals.env		= process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV;
	server.locals.db		= server.dataSources.db.settings.host ? server.dataSources.db.settings.host : 'local';
	mAdmin					= server.models.Admin;
	mContact				= server.models.Contact;
	mAccessToken			= server.models.AccessToken;
	var router				= server.loopback.Router();

	// ------------------------------------------------
	// Add Expires header to /images and /stylesheets directories
	// ------------------------------------------------

	router.get('/*', function(req, res, next) {
		if (config.trackIP) {
			var ip = requestIp.getClientIp(req);
			var geo = geoip.lookup(ip);
			if (geo) {
				logger.info('Received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (' + geo.city + ' ' + geo.zip + ' ' + geo.region + ' ' + geo.country + ')');
			} else {
				logger.info('Received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (machine locale)');
			}
		}
		if (req.url.indexOf('assets/images') >= 0 || req.url.indexOf('assets/css/') >= 0) {
			res.setHeader('Cache-Control', 'public, max-age=2592000');
			res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
		}

		res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.setHeader('Expires', '0');
		res.setHeader('Pragma', 'no-cache');

		next();
	});


	// index page
	router.get('/', function(req, res) {
		if (config.private === true) {
			if (!req.query.access_token && !req.accessToken) {		// not logged user, no login form data
				return res.render('login', {						// render the login page, empty form
					appName: config.appName,
					tokenName: config.tokenName,
					err: null
				});
			} else {
				getUser(req, function(err, roles) {
					if (err) {
						return res.render('login', {				// accessToken invalid, render the login page, empty form
							appName: config.appName,
							tokenName: config.tokenName,
							err: null
						});
					} else {										// logged user, accessToken granted
						var token = req.query.access_token || req.accessToken;
						mAdmin.setOnlineStatus(token, 'online');
						return res.render('index', {				// render the index
							appName: config.appName,
							tokenName: config.tokenName,
							roles: roles.split(','),
							err: null
						});
					}
				});
			}
		} else {
			res.render('index', {									// not logged user, no login form data, but ok, website is public
				appName: config.appName,
				tokenName: config.tokenName,
				err: null
			});
		}
	});
	router.post('/', function(req, res) {
		if (!req.body)
			return res.sendStatus(403);
		if (req.body.access_token) {								// logged user, accessToken granted
			// $$$ TODO: check if accessToken is legit.
			mAdmin.setOnlineStatus(req.body.access_token, 'online');
			return res.render('index', {							// render index
				appName: config.appName,
				tokenName: config.tokenName,
				roles: req.body.roles.split(','),	//ok
				err: null
			});
		} else {													// not logged user, login form credentials filled
			login(req, (err, tokenId, roles) => {
				if (err) {
					return res.sendStatus(err);
				} else {
					mAdmin.setOnlineStatusByTokenId(tokenId, 'online');
					return res.send({								// login granted. Send accessToken back to Login Form, that will post "/" again
						appName: config.appName,
						tokenName: config.tokenName,
						accessToken: tokenId,
						roles: roles,	//ok
						err: null
					});
				}
			});
		}
	});

	router.get('/dashboard', function(req, res) {
		if (!req.query.access_token && !req.accessToken) {
			return res.render('dashboard', {	// render the login form
				appName: config.appName,
				err: null,
				login: true
			});
		} else {
			// $$$ TODO: check if accessToken is legit.
			return res.render('dashboard', {	// render the login form
				appName: config.appName,
				err: null,
				accessToken: req.accessToken.token.id,
				login: false
			});
		}
	});


	router.post('/login', function(req, res) {
		login(req, (err, tokenId) => {
			if (err) {
				res.sendStatus(err);
			} else {
				res.send({accessToken: tokenId});
			}
		});
	});

	router.post('/dashboard', function(req, res) {
		if (!req.body)
			return res.sendStatus(403);
		if (req.body.access_token) {
			// $$$ TODO: check if accessToken is legit.
			mAdmin.setOnlineStatus(req.body.access_token, 'online');
			return res.render('dashboard', {
				appName: config.appName,
				err: null,
				accessToken: req.body.access_token,
				login: false
			});
		}
		login(req, (err, tokenId) => {
			if (err) {
				mAdmin.setOnlineStatusByTokenId(tokenId, 'offline');
				return res.sendStatus(err);
			} else {
				mAdmin.setOnlineStatusByTokenId(tokenId, 'online');
				return res.send({
					appName: config.appName,
					err: null,
					accessToken: tokenId,
					login: false
				});
			}
		});
	});

	// log a user out
	router.get('/logout', function(req, res, next) {
		if (!req.body)
			return res.sendStatus(403);
		if (!req.accessToken)
			return res.sendStatus(403);
		mAdmin.setOnlineStatusByTokenId(req.accessToken.id, 'offline');
		mAdmin.logout(req.accessToken.id, function(err) {
			if (err) return res.sendStatus(403);
			return res.redirect('/'); // on successful logout, redirect to home
		});
	});

	router.post('/contact', function(req, res, next) {
		if (!req.cookies.sent) {
			mContact.contact(req, function(err, result) {
				if (err) {
					return res.send(err);
				}
				/* On créé un cookie de courte durée (120 secondes) pour éviter de renvoyer un e-mail en rafraichissant la page */
				res.cookie('sent', '', {maxAge: 120, expires: new Date(Date.now() + 120), httpOnly: false});
				return res.send(result);
			});
		} else {
			return res.send({err: 'contact-area.error.message1'});
			// don't clear cookie --- res.clearCookie('sent');
		}
	});

	server.use(router);
};
