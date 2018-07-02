'use strict';

var path	= require('path');
var fs		= require('fs');
var debug	= require('debug')('ss_ico:i18n');
var config	= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


module.exports = function(I18n) {
	
	I18n.getSupportedLanguages = function(cb) {
		fs.readdir('client/assets/i18n', function(err, items) {
			for (var i = 0; i < items.length; i++) {
				items[i] = items[i].replace(/\.[^/.]+$/, '').toLowerCase();
			}
			process.nextTick(function() {
				cb(err, items);
			});
		});
	};

};
