'use strict';

var path	= require('path');
var async	= require('async');
//var moment	= require('moment');
var debug	= require('debug')('ss_ico:ico');
var config	= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


module.exports = function(ICO) {
	
	//var mUser = Purchase.app.models.User;

	ICO.SetStartDateTime = function(date, cb) {
		
		
		process.nextTick(function() {
			cb(err, null);
		});		
	};
	
	ICO.GetStartDateTime = function(cb) {
		
		//var date = moment.utc();
		//get startdate from database
		ICO.findById(1, function(err, ico) {
			var date = null;
			if (err) {
				debug('An error is reported from ICO.findById: %j', err);
			} else {
				date = ico.start;
			}
			process.nextTick(function() {
				cb(err, date);	// in seconds from now
			});	
		});	
	};
	

	ICO.GetICOData = function(cb) {
		ICO.findById(1, function(err, ico) {
			if (err) {
				debug('An error is reported from ICO.findById: %j', err);
			}
			process.nextTick(function() {
				cb(err, ico);	
			});	
		});	
	};

};
