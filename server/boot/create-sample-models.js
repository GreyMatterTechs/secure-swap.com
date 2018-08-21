/**
 * Module for database initialisation.
 *
 * @module CreateSampleModels
 * @file   This file defines the CreateSampleModels module.
 *
 * @author Philippe Aubessard
 * @copyright Grey Matter Technologies, 2018. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const path		= require('path');
const async		= require('async');
const appRoot	= require('app-root-path');
const config	= reqlocal(path.join('server', 'config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
const logger	= reqlocal(path.join('server', 'boot', 'winston.js')).logger;

// ------------------------------------------------------------------------------------------------------
// Local Vars
// ------------------------------------------------------------------------------------------------------

var db;
var dbName;
var mAdmin;
var mICO;
var mRole;
var mRoleMapping;

const HOUR_IN_MILLISECONDS	= 1000 * 60 * 60;
const DAY_IN_MILLISECONDS	= HOUR_IN_MILLISECONDS * 24;
const MONTH_IN_MILLISECONDS	= DAY_IN_MILLISECONDS * 30;
const YEAR_IN_MILLISECONDS	= DAY_IN_MILLISECONDS * 365;
const roles = {
	admin:		'admin',
	developer:	'developer',
	animator:	'animator',
	node:		'node',
	manager:	'manager',
	teammember:	'teammember',
	vip:		'vip',
	guest:		'guest'
};

var hour = 1;


// ------------------------------------------------------------------------------------------------------
// Private Methods
// ------------------------------------------------------------------------------------------------------

function updateRole(cb) {
	async.forEachOf(Object.values(roles), function(value, key, callback) {
		mRole.find({where: {name: value}}, function(err, roles) {
			if (err) return callback(err);
			if (roles && roles.length === 1) return callback();
			mRole.create({
				name: value
			}, function(err, role) {
				if (err) return callback(err);
				return callback();
			});
		});
	}, function(err) {
		if (err) return cb(err);
		return cb();
	});
}


function updateICO(cb) {

	var icoData = {
		state: 1,
		wallet: '0xC50E31926CAf2cd7C69547cB2C1Bb127cB782E30',
		tokenName: config.tokenName,
		tokenPriceUSD: 0.45,
		tokenPriceETH: 0.15414,
		softCap: 10000000,
		hardCap: 80000000,
		tokensTotal: 100000000,
		ethReceived: 0,
		ethTotal: 0,
		tokensSold: 0,
		dateStart: new Date(2018, 9, 1).getTime(),
		dateEnd: new Date(2019, 0, 31).getTime()
	};

	mICO.findById(1, function(err, inst) {
		if (err) return cb(err);
		if (inst) {
			inst.updateAttributes(icoData, function(err, ico) {
				if (err) return cb(err);
				return cb(null, ico);
			});
		} else {
			mICO.create(icoData, function(err, ico) {
				if (err) return cb(err);
				return cb(null, ico);
			});
		}
	});

}

function updateAdmins(cb) {

	function createRoles(user, roles, cb) {
		async.forEachOf(roles, function(role, key, callback) {
			mRole.find({where: {name: role}}, function(err, roles) {
				if (err) return callback(err);
				if (roles && roles.length === 1) {
					var mPrincipals = roles[0].principals;
					mPrincipals.find({where: {principalId: user.id}}, function(err, principals) {
						if (err) return callback(err);
						if (principals && principals.length === 1) return callback();
						mPrincipals.create({
							principalType: mRoleMapping.USER,
							principalId: user.id
						}, function(err, principal) {
							if (err) return callback(err);
							return callback();
						});
					});
				} else {
					return callback('Can\'t find Role admin');
				}
			});
		}, function(err) {
			if (err) return cb(err);
			return cb();
		});
	}

	function findOrCreate(account) {
		return new Promise(function(account, resolve, reject) {
			mAdmin.findOne({where: {email: account.userdata.email}}, function(err, inst) {
				if (err) return reject(err);
				if (inst) {
					createRoles(inst, account.userdata.roles, function(err, principal) {
						if (err) return reject(err);
						return resolve(inst);
					});
				} else {
					mAdmin.create(account.userdata, function(err, user) {
						if (err) return reject(err);
						createRoles(user, account.userdata.roles, function(err, principal) {
							if (err) return reject(err);
							return resolve(user);
						});
					});
				}
			});
		}.bind(null, account));
	}

	function addUsers(accounts) {
		var now = new Date().getTime();
		for (var d = 0; d < accounts.length; d++) {
			var account = accounts[d];
			account.userdata.dateCreated = account.userdata.dateLastUpdated = account.userdata.dateLastVisit = now;
			account.userdata.updatedBy = 'installer';
		}
		var promises = [];
		for (var i = 0; i < accounts.length; i++) {
			promises.push(findOrCreate(accounts[i]));
		}
		Promise.all(promises).then(function(users) {
			return cb(null, users);
		}, function(err) {
			logger.error(err);
			return cb(err);
		});
	}

	addUsers([{
		userdata: {
			username: 'sswp',				password: 'Xv4hmDly',			email: 'contact@secure-swap.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.node]
		}
	}, {
		userdata: {
			username: 'philippe',			password: 'wl9pwWFJ',			email: 'philippe@aubessard.net',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,			onlineStatus: 'offline',		roles: [roles.admin, roles.animator, roles.developer, roles.manager, roles.teammember]
		}
	}, {
		userdata: {
			username: 'alain',				password: 'ha3QS2sE',			email: 'alain.saffray@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,			onlineStatus: 'offline',		roles: [roles.admin, roles.animator, roles.developer, roles.manager, roles.teammember]
		}
	}, {
		userdata: {
			username: 'alicia',				password: 'tAcyij8i',			email: 'alikis13@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.manager, roles.teammember]
		}
	}, {
		userdata: {
			username: 'nadine',				password: 'Bbs8dxkm',			email: 'nadine.aubessard@free.fr',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.manager, roles.teammember]
		}
	}, {
		userdata: {
			username: 'renaud',				password: '25wzLntf',			email: 'renaud@desportes.net',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.manager, roles.teammember]
		}
	}, {
		userdata: {
			username: 'aliaksandr ',		password: '8XhJyph6',			email: 'samusiel@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.developer, roles.teammember]
		}
	}, {
		userdata: {
			username: 'victor',				password: '7sQhFXcO',			email: 'victor@chukholskiy.net',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.developer, roles.teammember]
		}
	}, {
		userdata: {
			username: 'rafael',				password: 'Ds34ddSG',			email: 'rafaelromcar@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.developer, roles.teammember]
		}
	}, {
		userdata: {
			username: 'pierre',				password: '5iC8k0Ni',			email: 'pierre@peretti.net',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.developer, roles.teammember]
		}
	}, {
		userdata: {
			username: 'wei',				password: 'd67D0Juv',			email: 'wei.zhan.cn@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'sonia',				password: 'vmYG3LyM',			email: 'sonia.montella@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'valentina',			password: 'VeO0mtf0',			email: 'valentinagalea@yahoo.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'marc',				password: '4IpBN2jM',			email: 'marc.rivoal@9online.fr',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'kevin',				password: 'AgJiMYAf',			email: 'kevinvanstaen@gmail.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'henry',				password: 'Hlk3tdA1',			email: 'henrrymorera@yahoo.es',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'edouard',			password: '7v7DV6Hk',			email: 'edouard@enault.net',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.animator, roles.teammember]
		}
	}, {
		userdata: {
			username: 'team',				password: 'B2xW6mkG',			email: 'team@secure-swap.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.teammember]
		}
	}, {
		userdata: {
			username: 'VIP',				password: 'KO8Rn3HR',			email: 'VIP@secure-swap.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.vip]
		}
	}, {
		userdata: {
			username: 'vip',				password: 'KO8Rn3HR',			email: 'vip@secure-swap.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.vip]
		}
	}, {
		userdata: {
			username: 'guest',				password: 'W6c2UNSF',			email: 'guest@secure-swap.com',
			active: true,					accessVerified: true,			verificationToken: null,
			emailVerified: true,											roles: [roles.guest]
		}
	}]);
}

function create(db, lbMigrateTables) {
	db.automigrate(lbMigrateTables, function(err) {
		if (err) throw err;
		logger.info('Loopback tables [' + lbMigrateTables + '] created in "' + dbName + '" database');
	});
}

function update(db, lbUpdateTables) {
	db.autoupdate(lbUpdateTables, function(err) {
		if (err) throw err;
		logger.info('Loopback tables [' + lbUpdateTables + '] created in "' + dbName + '" database');
		// create all models

		async.series([updateRole, updateICO, updateAdmins], function(err, result) {
			if (err) throw err;
			logger.info('> tables updated sucessfully');
		});
	});
}

// ------------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------------

/**
 * Module export
 *
 * @public
 * @param {Object} app Express App
 * @api public
 */
module.exports = function(app) {

	db = app.dataSources.db;
	dbName = db.settings.host ? db.settings.host : db.settings.file;
	mAdmin = app.models.Admin;
	mICO = app.models.ICO;
	mRole = app.models.Role;
	mRoleMapping = app.models.RoleMapping;

	var lbMigrateTables;
	var lbUpdateTables;

	if (process.env.NODE_ENV === 'production') {
		// on touche à rien
	} else {
		lbMigrateTables = ['ACL', 'RoleMapping'];
		lbUpdateTables = ['AccessToken', 'Role', 'Admin', 'ICO'];
		create(db, lbMigrateTables);
		update(db, lbUpdateTables);
	}

};
