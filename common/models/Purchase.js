'use strict';

var path	= require('path');
var async	= require('async');
//var moment	= require('moment');
var debug	= require('debug')('ss_ico:purchase');
var config	= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


module.exports = function(Purchase) {
	
	//var mUser = Purchase.app.models.User;

	Purchase.SetStartDateTime = function(date, cb) {
		
		
		process.nextTick(function() {
			cb(err, null);
		});		
	};
	
	Purchase.GetStartDateTime = function(cb) {
		
		//var date = moment.utc();
		//get startdate from database
		Purchase.findById(1, function(err, purchase) {
			var date = null;
			if (err) {
				debug('An error is reported from Purchase.findOne: %j', err);
			} else {
				date = purchase.start;
			}
			process.nextTick(function() {
				cb(err, date);	// in seconds from now
			});	
		});	
	};
	

	Purchase.GetPurchaseData = function(cb) {
		Purchase.findById(1, function(err, purchase) {
			if (err) {
				debug('An error is reported from Purchase.findOne: %j', err);
			}
			process.nextTick(function() {
				cb(err, purchase);	
			});	
		});	
	};

};
