'use strict';

var path		= require('path');
var fs			= require('fs');
var debug		= require('debug')('ss_ico:contact');
var config		= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var datasources	= require(path.join(__dirname, '../../server/datasources' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var loopback	= require('../../node_modules/loopback/lib/loopback');
var g			= require('../../node_modules/loopback/lib/globalize');
var validator	= require('validator');
var xssFilters	= require('xss-filters');
var app			= require('../../server/server');

function sendMail(data, mEmail, cb) {

	function makeOptions() {
		var options = {};
		options.to = config.mailRecipient.to;
		options.cc = config.mailRecipient.cc;
		options.bcc = config.mailRecipient.cci;
		options.replyTo = data.mail;
		options.subject = 'Contact from secureswap.com - ' + data.name;
		options.type = 'email';
		options.protocol = 'http';
		options.host = config.nginxhost;
		options.port = config.nginxport;
		options.displayPort = (
			(options.protocol === 'http' && options.port == '80') ||
			(options.protocol === 'https' && options.port == '443')
		) ? '' : ':' + options.port;
		options.from = config.mailProvider.auth.user;
		options.headers = options.headers || {};
		options.maildata = {
			db: datasources.db.host ? datasources.db.host : datasources.db.file,
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
					var errNum = 4;
					return cb({err: 'Sorry, message system is down. Error [0x300' + errNum + '].<br />Please retry later.'}, null);
				}
				return cb(null, {success: 'Message successfully sent. Thank you.'});
			});
		} else {
			mEmail.send(options, function(err, email) {
				if (err) {
					var errNum = 5;
					return cb({err: 'Sorry, message system is down. Error [0x300' + errNum + '].<br />Please retry later.'}, null);
				}
				return cb(null, {success: 'Message successfully sent. Thank you.'});
			});
		}
	});
}

module.exports = function(Contact) {

	// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
	Contact.disableRemoteMethodByName('upsert');                               // disables PATCH /Contacts
	Contact.disableRemoteMethodByName('find');                                 // disables GET /Contacts
	Contact.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /Contacts
	Contact.disableRemoteMethodByName('create');                               // disables POST /Contacts

	Contact.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /Contacts/{id}
	Contact.disableRemoteMethodByName('findById');                             // disables GET /Contacts/{id}
	Contact.disableRemoteMethodByName('exists');                               // disables HEAD /Contacts/{id}
	Contact.disableRemoteMethodByName('replaceById');                          // disables PUT /Contacts/{id}
	Contact.disableRemoteMethodByName('deleteById');                           // disables DELETE /Contacts/{id}

	Contact.disableRemoteMethodByName('prototype.__get__accessTokens');        // disable GET /Contacts/{id}/accessTokens
	Contact.disableRemoteMethodByName('prototype.__create__accessTokens');     // disable POST /Contacts/{id}/accessTokens
	Contact.disableRemoteMethodByName('prototype.__delete__accessTokens');     // disable DELETE /Contacts/{id}/accessTokens

	Contact.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Contacts/{id}/accessTokens/{fk}

	Contact.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Contacts/{id}/accessTokens/count

	Contact.disableRemoteMethodByName('prototype.verify');                     // disable POST /Contacts/{id}/verify
	Contact.disableRemoteMethodByName('changePassword');                       // disable POST /Contacts/change-password
	Contact.disableRemoteMethodByName('createChangeStream');                   // disable GET and POST /Contacts/change-stream

	Contact.disableRemoteMethodByName('confirm');                              // disables GET /Contacts/confirm
	Contact.disableRemoteMethodByName('count');                                // disables GET /Contacts/count
	Contact.disableRemoteMethodByName('findOne');                              // disables GET /Contacts/findOne

	//Contact.disableRemoteMethodByName('login');                                // disables POST /Contacts/login
	//Contact.disableRemoteMethodByName('logout');                               // disables POST /Contacts/logout

	Contact.disableRemoteMethodByName('resetPassword');                        // disables POST /Contacts/reset
	Contact.disableRemoteMethodByName('setPassword');                          // disables POST /Contacts/reset-password
	Contact.disableRemoteMethodByName('update');                               // disables POST /Contacts/update
	Contact.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Contacts/upsertWithWhere

	Contact.contact = function(req, cb) {
		
		// Filter bad requests
		if (!req) {
			return cb({err: 'bad request.'}, null);
		}
		// Check referers
		var validReferers = ['secureswap.com', 'http://localhost:3000/'];
		var referer = req.get('Referrer');
		referer = referer.replace(/www/i, '');
		if (!validReferers.includes(referer)) {
			return cb({err: 'bad request.'}, null);
		}
		// check form data
		if (!req.body.name || !req.body.mail || !req.body.message) {
			return cb({err: 'bad request.'}, null);
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
				return cb(null, successMessage);
			});
		} else {
			return cb({err: 'This Email format looks invalid. Please check.'}, null);
		}
	};

};
