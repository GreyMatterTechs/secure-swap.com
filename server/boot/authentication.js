/**
 * Module for Authentication.
 *
 * @module authentication
 * @file   This file defines the Authentication module. 
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} server Express App
 * @api public
 */
module.exports = function enableAuthentication(server) {
	// enable authentication
	server.enableAuth();
};
