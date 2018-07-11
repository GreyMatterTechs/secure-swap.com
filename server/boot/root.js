'use strict';

var requestIp	= require('request-ip');
var geoip		= require('geoip-lite');
var path		= require('path');
var bodyParser	= require('body-parser');
var config		= require(path.join(__dirname, '../config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));

var ONE_HOUR = 60 * 60;
var ONE_MINUTE = 60;

var mAdmin;
var mICO;
var mContact;

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


function login(req, cb) {
	if (!req.body) {
		return cb(403, null);
	}
	if (!req.body.username && !req.body.password){
		return cb(403, null);
	}
	mAdmin.login({
		username: req.body.username,
		password: req.body.password,
		ttl: ONE_MINUTE
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


module.exports = function(server) {
	server.locals.env		= process.env.NODE_ENV;
	server.locals.db		= server.dataSources.db.settings.host ? server.dataSources.db.settings.host : server.dataSources.db.settings.file;

	var router				= server.loopback.Router();
	var jsonParser			= bodyParser.json();	// parse application/json
	var urlencodedParser	= bodyParser.urlencoded({extended: true});	// parse application/x-www-form-urlencoded

	mAdmin					= server.models.Admin;
	mICO					= server.models.ICO;
	mContact				= server.models.Contact;


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


	router.get('/dashboard', urlencodedParser, function(req, res) {
		if (!req.query.access_token && !req.accessToken) {
			return res.render('dashboard', {	// render the login form
				err: null,
				login: true
			});
		} else {
			// $$$ TODO: check if accessToken is legit.
			return res.render('dashboard', {	// render the login form
				err: null,
				accessToken: req.accessToken.token.id,
				login: false
			});
		}
	});


	router.post('/login', urlencodedParser, function(req, res) {
		login(req, (err, tokenId) => {
			if (err) {
				res.sendStatus(err);
			} else {
				res.send({accessToken: tokenId});
			}
		});
	});

	router.post('/dashboard', urlencodedParser, function(req, res) {
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
	router.get('/logout', urlencodedParser, function(req, res, next) {
		if (!req.body)
			return res.sendStatus(403);
		if (!req.accessToken)
			return res.sendStatus(403);
		mAdmin.logout(req.accessToken.id, function(err) {
			if (err) return res.sendStatus(403);
			return res.redirect('/'); // on successful logout, redirect to home
		});
	});

	router.get('/contact', urlencodedParser, function(req, res, next) {
		if (!req.cookies['sent']) {
			mContact.contact(req, function(err, response) {
				if (err) {
					return res.sendStatus(err);
				}
				/* On créé un cookie de courte durée (120 secondes) pour éviter de renvoyer un e-mail en rafraichissant la page */  
				res.cookie('sent', '', {maxAge: 120, expires: new Date(Date.now() + 120), httpOnly: false});
				return res.send(response);
			});
		} else {
			return res.send('Message already sent');
			// don't clear cookie --- res.clearCookie('sent');
		}
	});

	server.use(router);
};
