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

	server.locals.env	= process.env.NODE_ENV;
	server.locals.db	= server.dataSources.db.settings.host ? server.dataSources.db.settings.host : server.dataSources.db.settings.file;

	var Admin			= server.models.Admin;	
	var router			= server.loopback.Router();
	var jsonParser		= bodyParser.json();	// parse application/json
	var urlencodedParser= bodyParser.urlencoded({ extended: true });	// parse application/x-www-form-urlencoded
	
	// ------------------------------------------------
	// Add Expires header to /images and /stylesheets directories
	// ------------------------------------------------

	router.get('/*', function(req, res, next) {
		var ip = requestIp.getClientIp(req);
		var geo = geoip.lookup(ip);
		if (geo) {
			console.log(config.appName + ' received request: ' + shorten(req.url, 64)+' from : '+ip+' ('+geo.city+' '+geo.zip+' '+geo.region+' '+geo.country+')' );
		} else {
			console.log(config.appName + ' received request: ' + shorten(req.url, 64)+' from : '+ip+' (machine locale)' );
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
	//router.get('/', server.loopback.status());

	//index page
	router.get('/', function (req, res) {
		res.render('index', {
			appName: config.appName,
			err: null
		});
	});


	//login page
	router.get('/login', function (req, res) {
		res.render('login', {
			appName: config.appName,
			err: null
		});
	});
	router.post('/login', urlencodedParser, function (req, res) {
		console.log(config.appName + ' post login');
		if (!req.body) 
			return res.sendStatus(400).send({ 
				appName: config.appName,
				err: 400
			});
		if (!req.accessToken) {
			Admin.login({
				username: req.body.username,
				password: req.body.password
			}, 'user', function (err, token) {
				if (err) {
					// err.code = "LOGIN_FAILED_EMAIL_NOT_VERIFIED"
					return res.sendStatus(err.statusCode).send({ 
						appName: config.appName,
						err: err.statusCode
						/*err.message	401 "échec de la connexion"
										400 "username ou email est obligatoire"
						*/
					});
				}
				Admin.findById(token.userId, function (err, user) {
					if (err) {
						// $$$ TODO: Trouver les types d'erreurs possibles ici, pour traite le statusCode dans le switch() de login.js
						debug('An error is reported from login: %j', err);
						Admin.setOnlineStatus(token, 'offline');
						Admin.logout(token.id);
						return res.sendStatus(err.statusCode).send({ 
							appName: config.appName,
							err: err.statusCode
						});
					} else {
						if (user) {
							if (!user.active) {
								Admin.setOnlineStatus(token, 'offline');
								Admin.logout(token.id);
								res.res.sendStatus(401).send({ 
									appName: config.appName,
									err: 401	// Account is not active, mais on ne l'affiche pas au client
								});
							} else {
								Admin.setOnlineStatus(token, 'online');
								return res.render( 'dashboard', { 
									appName: config.appName,
									err: null,
									accessToken: token.id
								});
							/*	// login succeed, now collect data for views, and go to dashboard
								Admin.getDashboard(token, function(err, templateName, params) {
									if (err) {
										debug('An error is reported from getDashboard: %j', err);
										User.setOnlineStatus(token, 'offline');
										User.logout(token.id);
										return res.send({ 
											appName: config.appName,
											err: err.message
										});
									} else {
										params.appName= config.appName;
										res.render(templateName, params);
									}
								});
							*/
							}
						} else {
							res.sendStatus(401).send({ 
								appName: config.appName,
								err: 401
							});
						}
					}
				});
			});
		} else {
			
			// $$$ TODO: check if accessToken is legit.

			Admin.setOnlineStatus(req.accessToken, "online");
			return res.send({ 
				appName: config.appName,
				err: null
			});
		/*	User.getDashboard(req.accessToken, function(err, templateName, params) {
				if (err) {
					debug('An error is reported from getDashboard: %j', err);
					User.setOnlineStatus(req.accessToken, 'offline');
					User.logout(req.accessToken.id);
					return res.send({ 
						appName: config.appName,
						err: err.message
					});
				} else {
					params.appName= config.appName;
					res.render(templateName, params);
				}
			});
		*/
		}
	});

	//dashboard page
	router.post('/dashboard', urlencodedParser, function (req, res) {
		console.log(config.appName + ' post dashboard');
		if (!req.body) 
			return res.sendStatus(400).send({ 
				appName: config.appName,
				err: 400
			});
		if (!req.accessToken)
			return res.sendStatus(400).send({ 
				appName: config.appName,
				err: 400
			});
		
		// $$$ TODO: check if accessToken is legit.

		return res.render('dashboard', {
			appName: config.appName,
			err: null
		});
	});
	

	server.use(router);
};
