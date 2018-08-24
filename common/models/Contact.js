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
const app			= require('../../server/server');
const datasources	= reqlocal(path.join('server', 'datasources' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const loopback		= reqlocal(path.join('node_modules', 'loopback', 'lib', 'loopback'));
const config		= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger		= reqlocal(path.join('server', 'boot', 'winston.js')).logger;

// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

function sendMail(data, mEmail, cb) {

	var dsEmail = app.dataSources.emailDS;

	function makeOptions() {
		var options = {};
		options.to = config.mailRecipient.to;
		options.cc = config.mailRecipient.cc;
		options.bcc = config.mailRecipient.cci;
		options.replyTo = data.mail;
		options.subject = '[Secure-Swap] Contact from ' + data.name;
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
			name: data.name,
			mail: data.mail,
			message: data.message
		};
		return options;
	}

	function createTemplatedEmailBody(options, cb) {
		var template = loopback.template(path.resolve(__dirname, '../../server/views/contactEmail.ejs'));
		cb(null, template(options));
	}

	var options = makeOptions();

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

	Contact.contact = function(req, cb) {
		logger.debug('Contact.contact()');

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
		if (!req.body.name || !req.body.mail || !req.body.message) {
			return cb({err: 'bad request'}, null);
		}
		var postData = {
			mail: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.mail))),
			name: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.name))),
			message: xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.message)))
		};
		if (validator.isEmail(postData.mail)) {
			postData.mail = validator.normalizeEmail(postData.mail);
			var mEmail = app.models.Email;
			sendMail(postData, mEmail, function(err, successMessage) {
				if (err) {
					return cb(err);
				}
				logger.info('Contact Form: Sent contact message from ' + postData.mail);
				return cb(null, successMessage);
			});
		} else {
			return cb({err: 'contact-area.error.message4'}, null);
		}
	};

};
