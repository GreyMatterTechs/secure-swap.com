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
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;

// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

const ONE_HOUR		= 60 * 60;
const ONE_MINUTE	= 60;
var mAdmin;
var mContact;

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
 * @param    {Object}   req Received HTTP request
 * @callback {Function} cb  Callback function
 * @param    {Error}    err Error information
 * @param    {String}   id  Token ID of logged in user
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
			return cb(err.statusCode, token.id);
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
					return cb(null, token.id);
				}
			});
		} else {
			return cb(403, token.id);
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
 * @param {Object} server Express App
 * @api public
 */
module.exports = function(server) {
	server.locals.env		= process.env.NODE_ENV;
	server.locals.db		= server.dataSources.db.settings.host ? server.dataSources.db.settings.host : server.dataSources.db.settings.file;
	mAdmin					= server.models.Admin;
	mContact				= server.models.Contact;
	var router				= server.loopback.Router();

	// ------------------------------------------------
	// Add Expires header to /images and /stylesheets directories
	// ------------------------------------------------

	router.get('/*', function(req, res, next) {
		var ip = requestIp.getClientIp(req);
		var geo = geoip.lookup(ip);
		if (geo) {
			logger.info(config.appName + ' received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (' + geo.city + ' ' + geo.zip + ' ' + geo.region + ' ' + geo.country + ')');
		} else {
			logger.info(config.appName + ' received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (machine locale)');
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
			if (!req.query.access_token && !req.accessToken) {
				return res.render('login', {
					appName: config.appName,
					err: null
				});
			} else {
				// $$$ TODO: check if accessToken is legit.
				return res.render('index', {	// render the index
					appName: config.appName,
					tokenName: config.tokenName,
					err: null
				});
			}
		} else {
			res.render('index', {
				appName: config.appName,
				tokenName: config.tokenName,
				err: null
			});
		}
	});
	router.post('/', function(req, res) {
		if (!req.body)
			return res.sendStatus(403);
		if (req.body.access_token) {
			// $$$ TODO: check if accessToken is legit.
			mAdmin.setOnlineStatus(req.body.access_token, 'online');
			return res.render('index', {
				appName: config.appName,
				tokenName: config.tokenName,
				accessToken: req.body.access_token,
				err: null
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
