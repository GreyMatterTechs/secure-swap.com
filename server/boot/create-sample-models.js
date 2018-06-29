'use strict';

var async		= require('async');

var db;
var dbName;
var mAdmin;
var mPurchase;
var mRole;
var mRoleMapping;

var HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 30; 
var YEAR_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 365;

var hour = 1;



function updateRole(cb) {
	mRole.find({where: {name: 'admin'}}, function(err, roles) {
		if (err) return cb(err);
		if (roles && roles.length === 1) return cb(null, roles[0]);
		mRole.create({
			name: 'admin'
		 }, function(err, role) {
			if (err) return cb(err);
			return cb(null, role);
		});
	});
}

function updatePurchases(cb) {

	mPurchase.findById(1, function(err, inst) {
		if (err) return cb(err);
		if (inst) return cb(null, inst);
		mPurchase.create({
			softCap:  5000000,
			hardCap: 30000000,
			tokensTotal: 1000000,
			tokensSold: 314358,
			start: new Date(2019,1,0).getTime()
		}, function(err, purchase) {
			if (err) return cb(err);
			return cb(null, purchase);
		});
	});

}

function updateAdmins(cb) {

	function createRole(user, cb) {
		mRole.find({where: {name: 'admin'}}, function(err, roles) {
			if (err) return cb(err);
			if (roles && roles.length === 1) {
				var mPrincipals = roles[0].principals;
				mPrincipals.find({where: {principalId: user.id}}, function(err, principals) {
					if (err) return cb(err);
					if (principals && principals.length === 1) return cb(null, principals[0]);
					mPrincipals.create({
						principalType: mRoleMapping.USER,
						principalId: user.id
					}, function(err, principal) {
						if (err) return cb(err);
						return cb(null, principal);
					});
				});
			} else {
				return cb('Can\'t find Role admin');
			}
		});
	}

	function findOrCreate(account) {
		return new Promise(function(account, resolve, reject) {
			mAdmin.findOne({where: {email: account.userdata.email}}, function(err, inst) {
				if (err) return reject(err);
				if (inst) {
					createRole(inst, function(err, principal) {
						if (err) return reject(err);
						return resolve(inst);
					});	
				} else {
					mAdmin.create(account.userdata, function(err, user) {
						if (err) return reject(err);
						createRole(user, function(err, principal) {
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
			account.userdata.updatedBy = 'Philippe';
		}	
		var promises = [];
		for (var i = 0; i < accounts.length; i++) {
			promises.push(findOrCreate(accounts[i]));
		}
		Promise.all(promises).then(function(users) {
			return cb(null, users);
		}, function(err) {
			console.log(err);
			return cb(err);
		});
	}

	addUsers([{
			userdata: {
				username: 'Aubessard',
				password: 'p',				
				email: 'philippe@aubessard.net',
				active: true,
				accessVerified: true,		
				verificationToken: null,	
				emailVerified: true,
				onlineStatus: 'offline'
			}
		}, {
			userdata: {
				username: 'Saffray',
				password: 'a',				
				email: 'alain@saffray.com',	
				active: true,
				accessVerified: true,		
				verificationToken: null,	
				emailVerified: true,
				onlineStatus: 'offline'
			}
		}
	]);
}

function create(db, lbMigrateTables) {
	db.automigrate(lbMigrateTables, function(err) {
		if (err) throw err;
		console.log('Loopback tables [' + lbMigrateTables + '] created in "' + dbName + '" database');
	});
}

function update(db, lbUpdateTables) {
	db.autoupdate(lbUpdateTables, function(err) {
		if (err) throw err;
		console.log('Loopback tables [' + lbUpdateTables + '] created in "' + dbName + '" database');
		//create all models

		async.series([updateRole, updatePurchases, updateAdmins],
			function(err, result) {
				if (err) throw err;
				console.log('> tables updated sucessfully');
			}
		);
	});	
}

module.exports = function (app) {

	db = app.dataSources.db;
	dbName = db.settings.host ? db.settings.host : db.settings.file;
	mAdmin = app.models.Admin;
	mPurchase = app.models.Purchase;
	mRole = app.models.Role;
	mRoleMapping = app.models.RoleMapping;

	var lbMigrateTables;
	var lbUpdateTables;

	if (process.env.NODE_ENV==='production') {
		// on touche à rien
	} else {
		lbMigrateTables = ['User', 'ACL', 'RoleMapping'];
		lbUpdateTables = ['AccessToken', 'Role', 'Admin', 'Purchase'];
		create(db, lbMigrateTables);
		update(db, lbUpdateTables);
	}

};
