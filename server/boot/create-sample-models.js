'use strict';

var async		= require('async');

var db;
var dbName;
var mAdmin;

var HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 30; 
var YEAR_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 365;

var hour = 1;


function updateAdmins(cb) {

	function findOrCreate(account) {
		return new Promise(function(account, resolve, reject) {
			mAdmin.findOne({where: {email: account.userdata.email}}, function(err, inst) {
				if (err) return reject(err);
				if (inst) return resolve(inst);
				mAdmin.create(account.userdata, function(err, user) {
					if (err) return reject(err);
					return resolve(user);
				});
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
		async.parallel({
			admins: async.apply(updateAdmins)
		}, function (err, results) {
			if (err) throw err;
			console.log('> models Admin created sucessfully');
		});
	});	
}

module.exports = function (app) {

	db = app.dataSources.db;
	dbName = db.settings.host ? db.settings.host : db.settings.file;
	mAdmin = app.models.Admin;
	
	var lbMigrateTables;
	var lbUpdateTables;

	if (process.env.NODE_ENV==='production') {
		// on touche à rien
	} else {
		lbMigrateTables = ['User', 'ACL', 'RoleMapping', 'Role'];
		lbUpdateTables = ['AccessToken', 'Admin'];
		create(db, lbMigrateTables);
		update(db, lbUpdateTables);
	}

};
