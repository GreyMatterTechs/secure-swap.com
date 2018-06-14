'use strict';

var requestIp	= require('request-ip');
var geoip		= require('geoip-lite');
var path		= require('path');
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

	server.locals.env = process.env.NODE_ENV;
	server.locals.db = server.dataSources.db.settings.host ? server.dataSources.db.settings.host : server.dataSources.db.settings.file;

	var router = server.loopback.Router();

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
			appName: config.appName
		});
	});

	server.use(router);
};
