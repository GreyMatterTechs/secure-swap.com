/**
 * Module for 404 Errors.
 *
 * @module url-not-found
 * @file   This file defines the 404 errors handler.
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
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;


// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @api public
 */
module.exports = function() {
	/**
	 * Convert any request not handled so far to a 404 error
	 * to be handled by error-handling middleware.
	 * @header loopback.urlNotFound()
	 */
	return function raiseUrlNotFoundError(req, res, next) {
		return res.sendFile(path.join(`${appRoot}`, 'client', '404.html'), function(err) {	// render 404 error page
			if (err) {
				logger.error(err);
				res.status(err.status).end();
			}
		});
	};
};
