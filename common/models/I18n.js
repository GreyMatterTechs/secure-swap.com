'use strict';

var fs			= require('fs');

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
