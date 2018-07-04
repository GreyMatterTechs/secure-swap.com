'use strict';

var path = require('path');
var fs = require('fs');
var debug = require('debug')('ss_ico:i18n');
var config = require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));


module.exports = function (I18n) {

	// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
	I18n.disableRemoteMethodByName('upsert');                               // disables PATCH /I18ns
	I18n.disableRemoteMethodByName('find');                                 // disables GET /I18ns
	I18n.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /I18ns
	I18n.disableRemoteMethodByName('create');                               // disables POST /I18ns

	I18n.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /I18ns/{id}
	I18n.disableRemoteMethodByName('findById');                             // disables GET /I18ns/{id}
	I18n.disableRemoteMethodByName('exists');                               // disables HEAD /I18ns/{id}
	I18n.disableRemoteMethodByName('replaceById');                          // disables PUT /I18ns/{id}
	I18n.disableRemoteMethodByName('deleteById');                           // disables DELETE /I18ns/{id}

	I18n.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /I18ns/{id}/accessTokens/{fk}
	I18n.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /I18ns/{id}/accessTokens/{fk}
	I18n.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /I18ns/{id}/accessTokens/{fk}

	I18n.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /I18ns/{id}/accessTokens/count

	I18n.disableRemoteMethodByName('count');                                // disables GET /I18ns/count
	I18n.disableRemoteMethodByName('findOne');                              // disables GET /I18ns/findOne

	I18n.disableRemoteMethodByName('update');                               // disables POST /I18ns/update
	I18n.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /I18ns/upsertWithWhere

	I18n.getSupportedLanguages = function (cb) {
		fs.readdir('client/assets/i18n', function (err, items) {
			for (var i = 0; i < items.length; i++) {
				items[i] = items[i].replace(/\.[^/.]+$/, '').toLowerCase();
			}
			process.nextTick(function () {
				cb(err, items);
			});
		});
	};

};
