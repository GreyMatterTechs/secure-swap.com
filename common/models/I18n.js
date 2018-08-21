/**
 * Module for i18N database table related features.
 *
 * @module i18N
 * @file   This file defines the i18N module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const fs		= require('fs');
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} I18n Model
 * @api public
 */
module.exports = function(I18n) {

	if (process.env.NODE_ENV !== undefined) {
		// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
		I18n.disableRemoteMethodByName('upsert');								// disables PATCH /I18ns
		I18n.disableRemoteMethodByName('find');									// disables GET /I18ns
		I18n.disableRemoteMethodByName('replaceOrCreate');						// disables PUT /I18ns
		I18n.disableRemoteMethodByName('create');								// disables POST /I18ns
		I18n.disableRemoteMethodByName('prototype.updateAttributes');			// disables PATCH /I18ns/{id}
		I18n.disableRemoteMethodByName('findById');								// disables GET /I18ns/{id}
		I18n.disableRemoteMethodByName('exists');								// disables HEAD /I18ns/{id}
		I18n.disableRemoteMethodByName('replaceById');							// disables PUT /I18ns/{id}
		I18n.disableRemoteMethodByName('deleteById');							// disables DELETE /I18ns/{id}
		I18n.disableRemoteMethodByName('prototype.__findById__accessTokens');	// disable GET /I18ns/{id}/accessTokens/{fk}
		I18n.disableRemoteMethodByName('prototype.__updateById__accessTokens');	// disable PUT /I18ns/{id}/accessTokens/{fk}
		I18n.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /I18ns/{id}/accessTokens/{fk}
		I18n.disableRemoteMethodByName('prototype.__count__accessTokens');		// disable  GET /I18ns/{id}/accessTokens/count
		I18n.disableRemoteMethodByName('createChangeStream');					// disables POST /I18ns/change-stream
		I18n.disableRemoteMethodByName('count');								// disables GET /I18ns/count
		I18n.disableRemoteMethodByName('findOne');								// disables GET /I18ns/findOne
		I18n.disableRemoteMethodByName('update');								// disables POST /I18ns/update
		I18n.disableRemoteMethodByName('upsertWithWhere');						// disables POST /I18ns/upsertWithWhere
	}

	/**
	 * Get the list of supported languages for GUI translations
	 * Usually called by SecureSwap website
	 *
	 * @method getSupportedLanguages
	 * @public
	 * @param    {String[]} roles List of roles
	 * @callback {Function} cb    Callback function
 	 * @param    {Error}    err   Error information
 	 * @return   {Object}   items Array of languages names
	 */
	I18n.getSupportedLanguages = function(roles, cb) {
		logger.info('I18n.getSupportedLanguages()');
		var path = 'client/assets/i18n';
		if (roles && (roles.indexOf('vip') > -1)) {
			path = 'client/assets/i18n_vip';
		}
		fs.readdir(path, function(err, items) {
			for (var i = 0; i < items.length; i++) {
				items[i] = items[i].replace(/\.[^/.]+$/, '').toLowerCase();
			}
			process.nextTick(function() {
				cb(err, items);
			});
		});
	};

};
