'use strict';

function determineAdminStatus(cb) {
	var isAuthorized = false;
	//if (err) return cb(err);
	cb(null, isAuthorized);
}

Roles.registerResolver('admin', function(role, context, cb) {
	determineAdminStatus(function(err, isAuthorized) {
		if (err) return cb(err);
		cb(null, isAuthorized);
	});
});
