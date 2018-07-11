'use strict';

var path = require('path');
var fs = require('fs');
var debug = require('debug')('ss_ico:i18n');
var config = require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var datasources	= require( path.join(__dirname, '../datasources' + (process.env.NODE_ENV!=='development' ? ('.'+process.env.NODE_ENV) : '') + '.json') );
var loopback = require('../../node_modules/loopback/lib/loopback');
var g		= require('../../node_modules/loopback/lib/globalize');
var validator = require('validator');
var xssFilters = require('xss-filters');
var mEmail;

function sendMail(data, cb) {

	function makeOptions() {
		var options			= {};
		options.to			= config.mailRecipient.to;
		options.cc			= config.mailRecipient.cc;
		options.cci			= config.mailRecipient.cci;
		options.subject		= 'Contact from secureswap.com - ' + data.name;
		options.type		= 'email';
		options.protocol	= 'http';
		options.host		= config.nginxhost;
		options.port		= config.nginxport;
		options.displayPort = (
			(options.protocol === 'http' && options.port == '80') ||
			(options.protocol === 'https' && options.port == '443')
		) ? '' : ':' + options.port;
		options.from		= config.mailProvider.auth.user;
		options.headers		= options.headers || {};
		options.maildata	= {
			db: datasources.db.host ? datasources.db.host : datasources.db.file,
			env: process.env.NODE_ENV
		};
		return options;
	}

	function createTemplatedEmailBody(options, cb) {
		var template = loopback.template(path.resolve(__dirname, '../views/contactEmail'));
		cb(null, template(options));
	}

	var options = makeOptions();

	createTemplatedEmailBody(options, function(err, html) {
		if (err) return cb(err);
		options.html = html;
		delete options.maildata;
		if (mEmail.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
			mEmail.send(options, null, function(err, email) {
				cb(err, email);
			});
		} else {
			mEmail.send(options, function(err, email) {
				cb(err, email);
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

	Contact.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Contacts/{id}/accessTokens/{fk}
	Contact.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Contacts/{id}/accessTokens/{fk}

	Contact.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Contacts/{id}/accessTokens/count

	Contact.disableRemoteMethodByName('count');                                // disables GET /Contacts/count
	Contact.disableRemoteMethodByName('findOne');                              // disables GET /Contacts/findOne

	Contact.disableRemoteMethodByName('update');                               // disables POST /Contacts/update
	Contact.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Contacts/upsertWithWhere

	Contact.contact = function(req, cb) {

		mEmail = Contact.app.models.Email;

		// Filter bad requests
		if (!req) {
			return cb(403, null);
		}

		// Check referers		
		var validReferers = ['secureswap.com', 'localhost:3000'];
		var referer = req.headers.referer;
		var referer2 = req.header('Referer');
		var referer3 = req.headers('Referer');
		var referer3 = req.get('Referrer'); // <-- maybe the best
		referer = referer.replace(/www/i, '');
		if (!validReferers.includes(referer)) {
			return cb(403, null);
		}

		if (!req.body.name || !req.body.email || !req.body.message){
			return cb(403, null);
		}

		var postData = {	'mail': xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.email))),
							'name': xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.name))),
							'language': xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.language))),
							'message': xssFilters.inHTMLData(validator.stripLow(validator.trim(req.body.message))) };
		if (validator.isEmail(postData.email)) {
			postData.mail = validator.normalizeEmail(postData.mail);
			sendMail(postData, function(err, email) {
				if (err) {
					// $errNum = 4;
					// $ret['debug'] .= "Send message failed. Error [0x300$errNum].<br />";
					// $ret['err'] = "Sorry, message system is down. Error [0x300$errNum].<br />Please retry later.";
					return cb(err);
				}
				// $ret['success'] = 'Message successfully sent. Thank you.';
				return cb(null, 'message sent');
			});
		} else {
			return cb(403, null);
		}
	};

};
