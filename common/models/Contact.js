/**
 * Module for Contact database table related features.
 *
 * @module Contact
 * @file   This file defines the Contact module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path			= require('path');
const validator		= require('validator');
const xssFilters	= require('xss-filters');
const request		= require('superagent');
const app			= reqlocal(path.join('server', 'server'));
const datasources	= reqlocal(path.join('server', 'datasources' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const loopback		= reqlocal(path.join('node_modules', 'loopback', 'lib', 'loopback'));
const config		= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger		= reqlocal(path.join('server', 'boot', 'winston.js')).logger;
const dsEmail		= app.dataSources.emailDS;


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

function makeOptions(data) {
	var options = {};
	options.to = config.mailRecipient.to;
	options.cc = config.mailRecipient.cc;
	options.bcc = config.mailRecipient.cci;
	options.replyTo = data.mail ? data.mail : null;
	options.subject = data.name ? ('[Secure-Swap] Contact from ' + data.name) : (data.mail ? '[Secure-Swap] Contact from <' + data.mail + '>' : '[Secure-Swap] Email from anonymous visitor');
	options.type = 'email';
	options.protocol = 'http';
	options.host = config.nginxhost;
	options.port = config.nginxport;
	options.displayPort = (
		(options.protocol === 'http' && options.port == '80') ||
		(options.protocol === 'https' && options.port == '443')
	) ? '' : ':' + options.port;
	// options.from = config.mailProvider.auth.user;
	options.from = dsEmail.adapter.transports[0].options.auth.user;
	options.headers = options.headers || {};
	options.maildata = {
		db: datasources.db.host || datasources.db.name || datasources.db.file,
		env: (process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV),
		name: data.name ? data.name : 'anonymous visitor',
		mail: data.mail ? data.mail : null,
		message: data.message ? data.message : null
	};
	options.ejs = data.message ? 'contactMessage.ejs' : 'contactEmail.ejs';
	return options;
}

function createTemplatedEmailBody(options, cb) {
	var template = loopback.template(path.resolve(__dirname, '../../server/views/' + options.ejs));
	cb(null, template(options));
}

function sendContact(data, mEmail, cb) {

	var options = makeOptions(data);

	createTemplatedEmailBody(options, function(err, html) {
		options.html = html;
		delete options.maildata;
		if (mEmail.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
			mEmail.send(options, null, function(err, email) {
				if (err) {
					return cb({err: 'contact-area.error.message5'}, null);
				}
				return cb(null, {success: 'contact-area.success.message'});
			});
		} else {
			mEmail.send(options, function(err, email) {
				if (err) {
					return cb({err: 'contact-area.error.message6'}, null);
				}
				return cb(null, {success: 'contact-area.success.message'});
			});
		}
	});
}


function sendJoin(data, mEmail, cb) {

	/*
	var options = makeOptions(data);

	createTemplatedEmailBody(options, function(err, html) {
		options.html = html;
		delete options.maildata;
		if (mEmail.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
			mEmail.send(options, null, function(err, email) {
				if (err) {
					return cb({err: 'joinbox.error.message5'}, null);
				}
				return cb(null, {success: 'joinbox.success.message'});
			});
		} else {
			mEmail.send(options, function(err, email) {
				if (err) {
					return cb({err: 'joinbox.error.message6'}, null);
				}
				return cb(null, {success: 'joinbox.success.message'});
			});
		}
	});
	*/

	// $$$ TODO: Implémenter Mailchimp ici
	return cb({success: 'joinbox.success.message'}, null);
}


function sendHead(data, mEmail, cb) {

	/*
	var options = makeOptions(data);

	createTemplatedEmailBody(options, function(err, html) {
		options.html = html;
		delete options.maildata;
		if (mEmail.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
			mEmail.send(options, null, function(err, email) {
				if (err) {
					return cb({err: 'head-area.error.message5'}, null);
				}
				return cb(null, {success: 'head-area.success.message'});
			});
		} else {
			mEmail.send(options, function(err, email) {
				if (err) {
					return cb({err: 'head-area.error.message6'}, null);
				}
				return cb(null, {success: 'head-area.success.message'});
			});
		}
	});
	*/

	// $$$ TODO: Implémenter Mailchimp ici
	return cb({success: 'head-area.success.message'}, null);
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
 * @param {Object} Contact Model
 * @api public
 */
module.exports = function(Contact) {

	if (process.env.NODE_ENV !== undefined) {
		// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
		Contact.disableRemoteMethodByName('upsert');								// disables PATCH /Contacts
		Contact.disableRemoteMethodByName('find');									// disables GET /Contacts
		Contact.disableRemoteMethodByName('replaceOrCreate');						// disables PUT /Contacts
		Contact.disableRemoteMethodByName('create');								// disables POST /Contacts

		Contact.disableRemoteMethodByName('prototype.updateAttributes');			// disables PATCH /Contacts/{id}
		Contact.disableRemoteMethodByName('findById');								// disables GET /Contacts/{id}
		Contact.disableRemoteMethodByName('exists');								// disables HEAD /Contacts/{id}
		Contact.disableRemoteMethodByName('replaceById');							// disables PUT /Contacts/{id}
		Contact.disableRemoteMethodByName('deleteById');							// disables DELETE /Contacts/{id}

		Contact.disableRemoteMethodByName('prototype.__get__accessTokens');			// disable GET /Contacts/{id}/accessTokens
		Contact.disableRemoteMethodByName('prototype.__create__accessTokens');		// disable POST /Contacts/{id}/accessTokens
		Contact.disableRemoteMethodByName('prototype.__delete__accessTokens');		// disable DELETE /Contacts/{id}/accessTokens

		Contact.disableRemoteMethodByName('prototype.__findById__accessTokens');	// disable GET /Contacts/{id}/accessTokens/{fk}
		Contact.disableRemoteMethodByName('prototype.__updateById__accessTokens');	// disable PUT /Contacts/{id}/accessTokens/{fk}
		Contact.disableRemoteMethodByName('prototype.__destroyById__accessTokens');	// disable DELETE /Contacts/{id}/accessTokens/{fk}

		Contact.disableRemoteMethodByName('prototype.__count__accessTokens');		// disable  GET /Contacts/{id}/accessTokens/count

		Contact.disableRemoteMethodByName('prototype.verify');						// disable POST /Contacts/{id}/verify
		Contact.disableRemoteMethodByName('changePassword');						// disable POST /Contacts/change-password
		Contact.disableRemoteMethodByName('createChangeStream');					// disable GET and POST /Contacts/change-stream

		Contact.disableRemoteMethodByName('confirm');								// disables GET /Contacts/confirm
		Contact.disableRemoteMethodByName('count');									// disables GET /Contacts/count
		Contact.disableRemoteMethodByName('findOne');								// disables GET /Contacts/findOne

		// Contact.disableRemoteMethodByName('login');                                // disables POST /Contacts/login
		// Contact.disableRemoteMethodByName('logout');                               // disables POST /Contacts/logout

		Contact.disableRemoteMethodByName('resetPassword');							// disables POST /Contacts/reset
		Contact.disableRemoteMethodByName('setPassword');							// disables POST /Contacts/reset-password
		Contact.disableRemoteMethodByName('update');								// disables POST /Contacts/update
		Contact.disableRemoteMethodByName('upsertWithWhere');						// disables POST /Contacts/upsertWithWhere
	}


	Contact.beforeRemote('**', function(ctx, modelInstance, next) {
		logger.info('model ' + ctx.req.method + ' \"' + ctx.req.baseUrl + ctx.req.path + '\"' + ' from: ' + ctx.req.clientIP + geo2str(ctx.req.geo));
		next();
	});


	Contact.contact = function(req, cb) {
		// Filter bad requests
		if (!req) {
			return cb({err: 'bad request'}, null);
		}
		// Check referers
		var validReferers = ['https://secure-swap.com/', 'https://www.secure-swap.com/', 'https://staging.secure-swap.com/', 'http://localhost:3000/'];
		var referer = req.get('Referrer');
		referer = referer.replace(/www/i, '');
		if (!validReferers.includes(referer)) {
			logger.warn('Contact Form: Received an Ajax call to /contact from referer:' + referer);
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (/*!req.body['contact-name'] || !req.body['contact-mail'] ||*/ !req.body['contact-message']) {
			return cb({err: 'bad request'}, null);
		}

		/*
		// g-recaptcha-response is the key that browser will generate upon form submit.
		// if its blank or null means user has not selected the captcha, so return the error.
		if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
			return cb({err: {responseCode: 1, responseDesc: 'Please select captcha'}}, null);
		}
		// Put your secret key here.
		var secretKey = '6LceZm0UAAAAAFPt30bkQW94rQIJMCZYjVCbTyPH';
		// req.connection.remoteAddress will provide IP address of connected user.
		var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;
		// Hitting GET request to the URL, Google will respond with success or error scenario.
		request
			.get(verificationUrl)
			.end((err, res) => {
				if (err) return cb({err: {responseCode: 1, responseDesc: 'Failed captcha verification'}}, null);
				var body = res;
				if (body.success !== undefined && !body.success) {
					return cb({err: {responseCode: 1, responseDesc: 'Failed captcha verification'}}, null);
				}
				*/

		var postData = {
			mail: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-mail']))),
			name: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-name']))),
			message: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-message'])))
		};
	//	if (validator.isEmail(postData.mail)) {
			postData.mail = validator.normalizeEmail(postData.mail);
			var mEmail = app.models.Email;
			sendContact(postData, mEmail, function(err, successMessage) {
				if (err) {
					return cb(err);
				}
				logger.info('Contact Form: Sent contact message from ' + (postData.mail ? postData.mail : 'anonymous sender'));
				return cb(null, successMessage);
			});
	//	} else {
	//		return cb({err: 'contact-area.error.message4'}, null);
	//	}
		/*		
			});
		*/
	};

	
	Contact.join = function(req, cb) {
		// Filter bad requests
		if (!req) {
			return cb({err: 'bad request'}, null);
		}
		// Check referers
		var validReferers = ['https://secure-swap.com/', 'https://www.secure-swap.com/', 'https://staging.secure-swap.com/', 'http://localhost:3000/'];
		var referer = req.get('Referrer');
		referer = referer.replace(/www/i, '');
		if (!validReferers.includes(referer)) {
			logger.warn('Join Form: Received an Ajax call to /join from referer:' + referer);
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (/*!req.body['contact-name'] ||*/ !req.body['contact-mail']) {
			return cb({err: 'bad request'}, null);
		}

		var postData = {
			mail: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-mail']))),
			name: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-name'])))
		};
		if (validator.isEmail(postData.mail)) {
			postData.mail = validator.normalizeEmail(postData.mail);
			var mEmail = app.models.Email;
			sendJoin(postData, mEmail, function(err, successMessage) {
				if (err) {
					return cb(err);
				}
				logger.info('Join Form: Sent join message from ' + postData.mail);
				return cb(null, successMessage);
			});
		} else {
			return cb({err: 'joinbox.error.message4'}, null);
		}
	};

	Contact.head = function(req, cb) {
		// Filter bad requests
		if (!req) {
			return cb({err: 'bad request'}, null);
		}
		// Check referers
		var validReferers = ['https://secure-swap.com/', 'https://www.secure-swap.com/', 'https://staging.secure-swap.com/', 'http://localhost:3000/'];
		var referer = req.get('Referrer');
		referer = referer.replace(/www/i, '');
		if (!validReferers.includes(referer)) {
			logger.warn('Head Form: Received an Ajax call to /head from referer:' + referer);
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (!req.body['head-mail']) {
			return cb({err: 'bad request'}, null);
		}

		var postData = {
			mail: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['head-mail'])))
		};
		if (validator.isEmail(postData.mail)) {
			postData.mail = validator.normalizeEmail(postData.mail);
			var mEmail = app.models.Email;
			sendHead(postData, mEmail, function(err, successMessage) {
				if (err) {
					return cb(err);
				}
				logger.info('Email Form: Sent email from ' + postData.mail);
				return cb(null, successMessage);
			});
		} else {
			return cb({err: 'head-area.error.message4'}, null);
		}
	};
};
