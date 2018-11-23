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


Chimp.makeSubscriber = function(user, listId) {
	if (!user.merge_fields) {
		user.merge_fields = {};
	}

	var subscriber = {
		email_address: user.email,
		double_optin: defaults.double_optin || false,
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
	if (user.language) {
		subscriber.language = user.language;
	}
	/*
	if (user.ip) {
		subscriber.ip_opt = user.ip;
		subscriber.merge_fields.optin_ip = user.ip;
	}
	*/

	subscriber.merge_fields = lo.merge(subscriber.merge_fields, user.merge_fields);

	return subscriber;
};


Chimp.subscribe = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {

		var subscriber = _this.makeSubscriber(user, listId);
		subscriber.status = 'pending';

		_this.MailChimp.request({
			method: 'POST',
			path: '/lists/{list_id}/members',
			path_params: {
				list_id: listId || defaults.defaultListId
			},
			body: subscriber,
			params: {}
		}, function(err, response) {
			if (err) {
				if (err.status === 400) {
					if (err.message.includes('looks fake or invalid')) {
						// "xxx@xxx.com looks fake or invalid, please enter a real email address."
						err.errNum = 2; // invalid email
						return reject(err);
					}
					if (err.message.includes('is already a list member')) {
						// "xxx@xxx.com is already a list member. Use PUT to insert or update list members."
						// This is an error but we will try to solve it by calling mailchimp.checkStatus()
						return resolve({errNum: 3}); // already exists
					}
				}
				err.errNum = 1; // Unknown error
				err.errNumSub = 1; // Add pending member failed
				return reject(err);
			} else {
				if (response.statusCode === 200 & response.status === 'subscribed') {
					// should not happen because subscriber.status == 'pending'
					// but if wa have a 'subscribed', then we have a weird good situation
					return resolve({errNum: 0}); // all good
				} else if (response.statusCode === 200 & response.status === 'pending') {
					return resolve({errNum: 0}); // all good
				} else {
					// should not happen
					err = new Error('Unknown Add pending member error');
					err.errNum = 1; // Unknown error
					err.errNumSub = 2; // Add pending member succeed but wrong
					return reject(err);
				}
			}
		});
	});
};


Chimp.checkStatus = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		_this.MailChimp.request({
			method:			'GET',
			path:			'/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id:	listId || defaults.defaultListId,
				member_id:	md5(user.email.toLowerCase())
			},
			params: {}
		}, function(err, response) {
			if (err) {
				err.errNum = 1; // Unknown error
				err.errNumSub = 3; // Get member info failed
				return reject(err);
			} else {
				return resolve(response);
			}
		});
	});
};


Chimp.delete = function(user, listId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.email) {
			var err = new Error('Email is required to unsubscribe.');
			err.errNum = 2; // invalid email
			return reject(err);
		}
		_this.MailChimp.request({
			method:			'DELETE',
			path:			'/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id:	listId || defaults.defaultListId,
				member_id:	md5(user.email.toLowerCase())
			},
			params: {}
		}, function(err, response) {
			if (err) {
				err.errNum = 1; // Unknown error
				err.errNumSub = 4; // Delete user failed
				return reject(err);
			} else {
				return resolve(response);
			}
		});
	});
};


Chimp.resubscribe = function(user, listId) {
	// https://stackoverflow.com/questions/42159327/resubscribe-a-user-to-a-mailchimp-list-after-unsubscribe
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.email) {
			var err = new Error('Email is required to unsubscribe.');
			err.errNum = 2; // invalid email
			return reject(err);
		}
		var subscriber = _this.makeSubscriber(user, listId);
		subscriber.status = 'pending';

		_this.MailChimp.request({
			method:			'PATCH',
			path:			'/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id:	listId || defaults.defaultListId,
				member_id:	md5(user.email.toLowerCase())
			},
			body: subscriber,
			params: {}
		}, function(err, response) {
			if (err) {
				err.errNum = 1; // Unknown error
				err.errNumSub = 5; // Resubscribe user failed
				return reject(err);
			} else {
				switch (user.oldStatus) {
				case 'pending':
					response.errNum = 5; // subscription was pending. subscription is now renewed
					break;
				case 'unsubscribed':
					response.errNum = 4; // user was unsubcribed . subscription is now renewed
					break;
				}
				return resolve(response);
			}
		});
	});
};


Chimp.unsubscribe = function(user, listId, accountId) {
	var _this = this;
	return new Promise(function(resolve, reject) {
		if (!user.email) {
			var err = new Error('Email is required to unsubscribe.');
			err.errNum = 2; // invalid email
			return reject(err);
		}
		_this.MailChimp.request({
			method:			'GET',
			path:			'/lists/{list_id}/members/{member_id}',
			path_params: {
				list_id:	listId || defaults.defaultListId,
				member_id:	md5(user.email.toLowerCase())
			},
			params: {}
		}, function(err, response) {
			if (err) {
				if (err.status === 404) {
					if (err.message.includes('resource could not be found')) {
						err.errNum = 2; // invalid email
						return reject(err);
					}
				}
				err.errNum = 1; // Unknown error
				err.errNumSub = 3; // Get member info failed
				return reject(err);
			} else {
				switch (response.status) {
				case 'pending':
				case 'cleaned':
				case 'subscribed':
					var params = '?u=' + (accountId || defaults.defaultAccountId) + '&id=' + (listId || defaults.defaultListId) + '&e=' + response.unique_email_id;
					return resolve({errNum: 5, params: params});
				case 'unsubscribed':
					err = new Error('Unsubscribe member error');
					err.errNum = 6; // email already unsubscribed
					return reject(err);
				default:
					// unknown error
					err = new Error('Unsubscribe member error');
					err.errNum = 1; // Unknown error
					err.errNumSub = 3; // Get member info failed
					return reject(err);
				}
			}
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
