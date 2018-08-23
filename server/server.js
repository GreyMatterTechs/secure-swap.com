/**
 * Module for Express HTTP Server.
 *
 * @module server
 * @file   This file defines the server module.
 *
 * @author Philippe Aubessard
 * Copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// globals
// ------------------------------------------------------------------------------------------------------

global.reqlocal		= require('app-root-path').require;

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path			= require('path');
const loopback		= require('loopback');
const boot			= require('loopback-boot');
const helmet		= require('helmet');
const cookieParser	= require('cookie-parser');
const bodyParser	= require('body-parser');
const config		= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger		= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// $$$ TODO : etudier tous ces liens pour le login :

// feb 2016  http://blog.digitopia.com/tokens-sessions-users/
// mar 2016  https://github.com/strongloop/loopback/issues/2142
// sep 2017  https://stackoverflow.com/questions/35969364/setting-access-token-cookie-in-loopback

// https://blog.codinghorror.com/protecting-your-cookies-httponly/
// https://github.com/expressjs/cookie-parser

// http://apidocs.strongloop.com/loopback/#loopback-token
// https://github.com/strongloop/loopback/issues/2142
// http://loopback.io/doc/en/lb3/Making-authenticated-requests.html
// https://github.com/strongloop/loopback-example-user-management
// test

// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var app = module.exports = loopback();

// ------------------------------------------------------------------------------------------------------
// Main program
// ------------------------------------------------------------------------------------------------------

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setting up loopback
app.use(loopback.static(path.resolve(__dirname, '../client')));
app.use(loopback.token());

// a bit of security
app.use(helmet());
app.set('trust proxy', 'loopback');

// cookies
app.use(cookieParser());

// $$$ TODO https://github.com/strongloop/loopback-example-ssl
//          et passer en TLS

// $$$ TODO intégrer GZIp
// https://strongloop.com/strongblog/best-practices-for-express-in-production-part-two-performance-and-reliability/#code

// $$$ TODO Use a caching server like Varnish or Nginx (see also Nginx Caching) to greatly improve the speed and performance of your app.
// https://www.nginx.com/resources/wiki/start/topics/examples/reverseproxycachingexample/
// https://serversforhackers.com/c/nginx-caching

var port = normalizePort(process.env.PORT || config.port);
app.set('port', port);

app.start = function() {
	// start the web server
	return app.listen(function() {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		logger.info('Web server listening at: ' + baseUrl);
		logger.info('Running Environment: ' + (process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV));
		logger.info('NodeJS server URL: ' + 'http://' + config.host + ':' + port);
		logger.info('Nginx  server URL: ' + 'http://' + config.nginxhost + ':' + config.nginxport);

		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			logger.info('Browse your REST API at ' + baseUrl + explorerPath);
		}
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
	if (err) throw err;

	// start the server if `$ node server.js`
	if (require.main === module)
		app.start();
});

// Normalize a port into a number, string, or false.
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) { return val; }
	if (port >= 0) { return port; }
	return false;
}
