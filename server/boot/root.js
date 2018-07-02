'use strict';

var requestIp	= require('request-ip');
var geoip		= require('geoip-lite');
var path		= require('path');
var bodyParser	= require('body-parser');
var config		= require(path.join(__dirname, '../config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


function isString(val) {
	return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
}

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

module.exports = function(server) {
	server.locals.env		= process.env.NODE_ENV;
	server.locals.db		= server.dataSources.db.settings.host ? server.dataSources.db.settings.host : server.dataSources.db.settings.file;

	var Admin				= server.models.Admin;
	var router				= server.loopback.Router();
	var jsonParser			= bodyParser.json();	// parse application/json
	var urlencodedParser	= bodyParser.urlencoded({extended: true});	// parse application/x-www-form-urlencoded

	// ------------------------------------------------
	// Add Expires header to /images and /stylesheets directories
	// ------------------------------------------------

	router.get('/*', function(req, res, next) {
		var ip = requestIp.getClientIp(req);
		var geo = geoip.lookup(ip);
		if (geo) {
			console.log(config.appName + ' received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (' + geo.city + ' ' + geo.zip + ' ' + geo.region + ' ' + geo.country + ')');
		} else {
			console.log(config.appName + ' received request: ' + shorten(req.url, 64) + ' from : ' + ip + ' (machine locale)');
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


	// Install a `/` route that returns server status
	// router.get('/', server.loopback.status());

	// index page
	router.get('/', function(req, res) {
		res.render('index', {
			appName: config.appName,
			err: null
		});
	});

	var ONE_HOUR = 60 * 60;
	router.get('/dashboard', urlencodedParser, function(req, res) {
		console.log(config.appName + ' post login');
		if (!req.body)
			return res.send({
				appName: config.appName,
				err: 400
			});
		if (!req.accessToken) {
			if (!req.body.username &&
				!req.body.password) {
				return res.render('dashboard', {
					appName: config.appName,
					err: null
				});
			} else {
			}
		}
	});

	router.post('/dashboard', urlencodedParser, function(req, res) {
		console.log(config.appName + ' post login');
		if (!req.body)
			return res.send({
				appName: config.appName,
				err: 400
			});
		if (!req.accessToken) {
			if (!req.body.username &&
				!req.body.password) {
				return res.send({
					appName: config.appName,
					err: 401
				});
			} else {
				Admin.login({
					username: req.body.username,
					password: req.body.password,
					ttl: ONE_HOUR
				}, 'user', function(err, token) {
					if (err) {
						// err.code = "LOGIN_FAILED_EMAIL_NOT_VERIFIED"
						return res.send({
							appName: config.appName,
							err: err.statusCode
						});
					}
					Admin.findById(token.userId, function(err, user) {
						if (err) {
							// $$$ TODO: Trouver les types d'erreurs possibles ici, pour traite le statusCode dans le switch() de login.js
							// debug('An error is reported from login: %j', err);
							Admin.setOnlineStatus(token, 'offline');
							Admin.logout(token.id);
							return res.send({
								appName: config.appName,
								err: err.statusCode
							});
						} else {
							if (user) {
								if (!user.active) {
									Admin.setOnlineStatus(token, 'offline');
									Admin.logout(token.id);
									res.res.send({
										appName: config.appName,
										err: 401	// Account is not active, mais on ne l'affiche pas au client
									});
								} else {
									Admin.setOnlineStatus(token, 'online');
									return res.render('partials/dashboard', {
										appName: config.appName,
										err: null,
										accessToken: token.id
									});
								}
							} else {
								res.send({
									appName: config.appName,
									err: 401
								});
							}
						}
					});
				});
			}
		} else {
			// $$$ TODO: check if accessToken is legit.

			Admin.setOnlineStatus(req.accessToken, 'online');
			return res.render('partials/dashboard', {
				appName: config.appName,
				err: null,
				accessToken: req.accessToken.token.id
			});
		}
	});

	// log a user out
	router.get('/logout', urlencodedParser, function(req, res, next) {
		if (!req.body)
			return res.send({
				appName: config.appName,
				err: 400
			});
		if (!req.accessToken)
			return res.send({
				appName: config.appName,
				err: 401	// return 401:unauthorized if accessToken is not present
			});
		Admin.logout(req.accessToken.id, function(err) {
			if (err) return next(err);
			res.redirect('/'); // on successful logout, redirect
		});
	});


	server.use(router);
};
