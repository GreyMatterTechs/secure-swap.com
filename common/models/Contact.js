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
const app			= reqlocal(path.join('server', 'server'));
const datasources	= reqlocal(path.join('server', 'datasources' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const loopback		= reqlocal(path.join('node_modules', 'loopback', 'lib', 'loopback'));
const config		= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger		= reqlocal(path.join('server', 'boot', 'winston.js')).logger;
const dsEmail		= app.dataSources.emailDS;

const mailchimp		= reqlocal(path.join('server', 'components', 'mailchimp.js'));

mailchimp.init({
	apiKey:				config.mcApiKey,
	defaultAccountId:	config.mcAccountId,
	defaultListId:		config.mcListId,	// Liste 'SecureSwap Subscribers'
	doubleOptin:		false
});


// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

function makeOptions(data) {
	var options = {};
	var name = data.fname && data.lname ? (data.fname + ' ' + data.lname) 
										: (data.fname ? (data.fname) 
													  : (data.lname ? (data.lname) 
													  				: ('')));
	options.to = config.mailRecipient.to;
	options.cc = config.mailRecipient.cc;
	options.bcc = config.mailRecipient.cci;
	options.replyTo = data.mail ? data.mail : null;
	options.subject = name ? ('[Secure-Swap] Contact from ' + name) : (data.mail ? '[Secure-Swap] Contact from <' + data.mail + '>' : '[Secure-Swap] Email from anonymous visitor');
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
		name: name ? name : 'anonymous visitor',
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

function sendMessage(data, mEmail, cb) {

	var options = makeOptions(data);

	createTemplatedEmailBody(options, function(err, html) {
		if (err) {
			return cb({errNum: 1, errNumSub: 10}, null);
		}
		options.html = html;
		delete options.maildata;
		if (mEmail.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
			mEmail.send(options, null, function(err, email) {
				if (err) {
					return cb({errNum: 1, errNumSub: 11}, null);
				}
				return cb(null);
			});
		} else {
			mEmail.send(options, function(err, email) {
				if (err) {
					return cb({errNum: 1, errNumSub: 11}, null);
				}
				return cb(null);
			});
		}
	});
}


function geo2str(geo) {
	if (geo) return ' (' + geo.city + ',' + geo.region + ',' + geo.country + ')';
	return ' (localhost)';
}


function isBadRequest(req, call) {
	// Filter bad requests
	if (!req) return true;
	// Check referers
	var validReferers = ['https://secure-swap.com/', 'https://www.secure-swap.com/', 'https://staging.secure-swap.com/', 'http://localhost:3000/'];
	var referer = req.get('Referrer');
	referer = referer.replace(/www/i, '');
	if (!validReferers.includes(referer)) {
		logger.warn('Received an Ajax call to ' + call + +' from referer:' + referer);
		return true;
	}
	return false;
}


function unsubscribe(user, cb) {
	mailchimp.unsubscribe(user)
		.then(function(response) { // mailchimp.unsubscribe()
			logger.info('Unsubscribe Form: Successfully got unsubscribe link for: ' + user.email);
			response.url = config.mcUnsubscribUrl + response.params;
			return cb(null, response);
		})
		.catch(function(err) {
			// err.errNum = 1: unknown error
			//                 errNumSub = 1: Add pending member failed
			//                 errNumSub = 2: Add pending member succeed but wrong
			//                 errNumSub = 3: Get member info failed
			//                 errNumSub = 4: Delete user failed
			//                 errNumSub = 5: Resubscribe user failed
			//                 errNumSub = 6: Unsubscribe user failed
			//              2: invalid email
			//              7: email already unsubscribed
			return cb({errNum: err.errNum, errNumSub: err.errNumSub | null}, null);
		});
}


function subscribe(user, cb) {
	mailchimp.subscribe(user)
		.then(function(response) { // mailchimp.subscribe()
			switch (response.errNum) {
			case 0:
				logger.info('Subscribe Form: Successfully Add pending: ' + user.email);
				return cb(null, {errNum: response.errNum});
			case 3:
				logger.info('Subscribe Form: ' + user.email + ' is already a list member.');
				// check why subscribe failed
				return mailchimp.checkStatus(user);
			default:
				// unknown error
				return cb({errNum: 1, errNumSub: 7}, null);
			}
		})
		.then(function(response) { //  mailchimp.checkStatus()
			switch (response.status) {
			case 'pending':			// resubmit
				// here we have 2 solutions:
				// 1. resubscribe him
				// 2. tell him he has a pending subscription
				// but we don't know if he received the confirmation email,
				// so we will use option 1.
				user.oldStatus = response.status;
				return mailchimp.resubscribe(user); // and then subscribe() again
			case 'subscribed':		// already registered
				return cb(null, {errNum: 3});
			case 'unsubscribed':	// resubscribe
				user.oldStatus = response.status;
				return mailchimp.resubscribe(user);
			default:
				// unknown error
				return cb({errNum: 1, errNumSub: 8}, null);
			}
		})
		.then(function(response) { //  mailchimp.resubscribe()
			if (typeof response !== 'undefined' && response.hasOwnProperty('errNum')) {
				switch (response.errNum) {
				case 4: // come from resubscribe()
				case 5: // come from resubscribe()
					logger.info('Subscribe Form: Successfully Add pending: ' + user.email);
					return cb(null, {errNum: response.errNum}); // 4: user was unsubcribed
																// 5: subscription was pending.
				default:
					// unknown error
					return cb({errNum: 1, errNumSub: 9}, null);
				}
			}
		})
		.catch(function(err) {
			// err.errNum = 1: unknown error
			//                 errNumSub = 1: Add pending member failed
			//                 errNumSub = 2: Add pending member succeed but wrong
			//                 errNumSub = 3: Get member info failed
			//                 errNumSub = 4: Delete user failed
			//                 errNumSub = 5: Resubscribe user failed
			//              2: invalid email
			return cb({errNum: err.errNum, errNumSub: err.errNumSub | null}, null);
		});
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
		if (isBadRequest(req, '/contact')) {
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (/* !req.body['contact-fname'] || !req.body['contact-lname'] || !req.body['contact-mail'] || */ !req.body['contact-message']) {
			return cb({err: 'bad request'}, null);
		}

		var postData = {
			mail: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-mail']))),
			fname: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-fname']))),
			lname: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-lname']))),
			message: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['contact-message']))),
			lang: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['lang'])))
		};

		if (postData.mail) {
			if (validator.isEmail(postData.mail)) {
				postData.mail = validator.normalizeEmail(postData.mail);
			} else {
				// return cb({err: 'contact-area.error.message4'}, null);
				return cb({errNum: 2}, null); // invalid email
			}
		}
		var mEmail = app.models.Email;
		sendMessage(postData, mEmail, function(err) {
			if (err) {
				// err.errNum = 1: unknown error
				//                 errNumSub = 10: Email templating failed
				//                 errNumSub = 11: Email sending failed
				return cb(err);
			}
			logger.info('Contact Form: Sent contact message from ' + (postData.mail ? postData.mail : 'anonymous sender'));
			// return cb(null, successMessage);
			return cb(null, {errNum: 0});
		});
	};


	Contact.join = function(req, cb) {
		// Filter bad requests
		if (isBadRequest(req, '/join')) {
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (/* !req.body['joinbox-fname'] || !req.body['joinbox-lname'] || */ !req.body['joinbox-mail']) {
			return cb({err: 'bad request'}, null);
		}

		var user = {
			email: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['joinbox-mail']))),
			firstName: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['joinbox-fname']))),
			lastName: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['joinbox-lname']))),
			language: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['lang'])))
		};
		if (validator.isEmail(user.email)) {
			user.email = validator.normalizeEmail(user.email);
			user.firstName = user.firstName === '' ? null : user.firstName;
			user.lastName = user.lastName === '' ? null : user.lastName;
			user.language = user.language === '' ? null : user.language;
			return subscribe(user, cb);
		} else {
			return cb({errNum: 2}, null); // invalid email
		}
	};


	Contact.unjoin = function(req, cb) {
		// Filter bad requests
		if (isBadRequest(req, '/unjoin')) {
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (!req.body['unjoinbox-mail']) {
			return cb({err: 'bad request'}, null);
		}

		var user = {
			email: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['unjoinbox-mail']))),
			language: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['lang'])))
		};
		if (validator.isEmail(user.email)) {
			user.email = validator.normalizeEmail(user.email);
			user.language = user.language === '' ? null : user.language;
			return unsubscribe(user, cb);
		} else {
			return cb({errNum: 2}, null); // invalid email
		}
	};


	Contact.head = function(req, cb) {
		// Filter bad requests
		if (isBadRequest(req, '/head')) {
			return cb({err: 'bad request'}, null);
		}
		// check form data
		if (!req.body['head-mail']) {
			return cb({err: 'bad request'}, null);
		}

		var user = {
			email: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['head-mail']))),
			language: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body['lang'])))
		};
		if (validator.isEmail(user.email)) {
			user.email = validator.normalizeEmail(user.email);
			user.language = user.language === '' ? null : user.language;
			return subscribe(user, cb);
		} else {
			return cb({errNum: 2}, null); // invalid email
		}
	};
};
