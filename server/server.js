'use strict';

var loopback	= require('loopback');
var boot		= require('loopback-boot');
var path		= require('path');
var helmet		= require('helmet');
var config		= require(path.join(__dirname, 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV) ) + '.json'));


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


var app = module.exports = loopback();

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setting up loopback
app.use(loopback.static(path.resolve(__dirname, '../client')));
app.use(loopback.token());

// a bit of security
app.use(helmet());
app.set('trust proxy', 'loopback');

// $$$ TODO https://github.com/strongloop/loopback-example-ssl
//          et passer en TLS


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
	console.log('Running Environment: ' + (process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV ));
	console.log('NodeJS server URL: ' + 'http://' + config.host + ':' + config.port);
	console.log('Nginx  server URL: ' + 'http://' + config.nginxhost + ':' + config.nginxport);

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
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
