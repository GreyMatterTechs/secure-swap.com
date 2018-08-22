/**
 * Module for Errors handling.
 *
 * @module errorsHandler
 * @file   This file defines the errorsHandler module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';


// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
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
	return function logError(err, req, res, next) {
		if (err.status === 401 && err.statusCode === 401 && err.code === 'INVALID_TOKEN') {
			return res.render('login', {					// render the login page, empty form
				appName: config.appName,
				tokenName: config.tokenName,
				err: null
			});
		} else {
			logger.error(err.message);
			next(err);
		}
	};
};
