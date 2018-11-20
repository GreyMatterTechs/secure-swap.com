/**
 * Module for Mailchimp.
 *
 * @module mailchimp
 * @file   This file defines the mailchimp module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const appRoot	= require('app-root-path');
const Mailchimp	= require('mailchimp-api-v3');
const Promise	= require('bluebird');
const lo		= require('lodash');
const md5		= require('md5');
const moment	= require('moment');
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.js'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var Chimp = {};
var defaults;


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------


Chimp.init = function(_defaults) {
	defaults = _defaults;
	Chimp.MailChimp = new Mailchimp(defaults.apiKey);
};


/*
MailChimp.json {
	"name":			"MailChimp",
	"base":			"Model",
	"properties":	{
	  "id":				{"type": "string", "required": true},
	  "email":			{"type": "string", "required": true},
	  "double_optin":	{"type": "boolean"},
	  "merge_vars":		{"type": "object"}
	}
}
default = {
	apiKey:			'fefffdfdbe8e4d050156dd8927ff75f5-us12',
	defaultListId:	'6b0fc88f5b', // Liste 'Subscribers'
	doubleOptin:	true
});
user = {
	email:		'user@email.com',
	firstName:	'A name',
	lastName:	'A surname',
	language:	'fr',
	merge_fields:	{
		optin_ip:	'192.168.0.1'
	}
};
*/

Chimp.subscribe = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.merge_fields) {
			user.merge_fields = {};
		}

		var subscriber = {
			email_address: user.email,
			double_optin: defaults.double_optin || false,
			status: 'pending',
			timestamp_opt: moment().format('YYYY-MM-DD HH:mm:ss'), 
			list_id: listId || defaults.defaultListId,
			merge_fields: {
				EMAIL: user.email
			}
		};

		if (user.firstName) {
			subscriber.merge_fields.FNAME = user.firstName;
		}
		if (user.lastName) {
			subscriber.merge_fields.LNAME = user.lastName;
		}
		/*
		if (user.ip) {
			subscriber.ip_opt = user.ip;
			subscriber.merge_fields.optin_ip = user.ip;
		}
		*/

		subscriber.merge_fields = lo.merge(subscriber.merge_fields, user.merge_fields);

		_this.MailChimp.request({
			method: 'POST',
			path: '/lists/{list_id}/members',
			path_params: {
				list_id: listId || defaults.defaultListId
			},
			body: subscriber,
			params: {}
		}, function(err, response) {
			var errNum = 0;
			if (err) {
				errNum = 1; // Unknown Add member error
				if (err.status === 400) {
					if (err.message.includes('looks fake or invalid')) {
						// "xxx@xxx.com looks fake or invalid, please enter a real email address."
						errNum = 2; // invalid email
					}
					if (err.message.includes('is already a list member')) {
						// "xxx@xxx.com is already a list member. Use PUT to insert or update list members."
						errNum = 3; // already exists
					}
				}
				err.errNum = errNum;
				return reject(err);
			} else {
				if (response.statusCode === 200 & response.status === 'subscribed') {
					errNum = 0; // all good
				} else {
					errNum = 1; // Unknown Add member error
				}
				resolve({errNum: errNum});
			}
		});
	});
};


Chimp.checkStatus = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {

		_this.MailChimp.request({
			method: 'GET',
			path: '/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id: listId || defaults.defaultListId,
				member_id: md5(user.email.toLowerCase())
			},
			params: {}
		}, function(err, response) {
			if (err) {
				err.errNum = 11;
				return reject(err);
			} else {
				resolve(response);
			}
		});
	});
};


Chimp.unsubscribe = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.email) {
			return reject(new Error("Email is required to unsubscribe."));
		}

		_this.MailChimp.request({
			method: 'PATCH',
			path: '/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id: listId || defaults.defaultListId,
				member_id: md5(user.email.toLowerCase())
			},
			body: {
				"status": "unsubscribed"
			},
			params: {}
		}, function(err, response) {
			if (err) {
				return reject(err);
			}

			resolve(response);
		});
	});
};

Chimp.delete = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.email) {
			return reject(new Error("Email is required to delete."));
		}

		_this.MailChimp.request({
			method: 'DELETE',
			path: '/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id: listId || defaults.defaultListId,
				member_id: md5(user.email.toLowerCase())
			},
			params: {}
		}, function(err, response) {
			if (err) {
				return reject(err);
			}

			resolve(response);
		});
	});
};


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @api public
 */
module.exports = Chimp;
