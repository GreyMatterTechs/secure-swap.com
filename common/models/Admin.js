'use strict';

var path		= require('path');
var async		= require('async');
var passGen		= require('password-generator');
var uuidV1		= require('uuid/v1');
var g			= require('../../node_modules/loopback/lib/globalize');
var loopback	= require('../../node_modules/loopback/lib/loopback');
var utils		= require('../../node_modules/loopback/lib/utils');
var config		= require(path.join(__dirname, '../../server/config' + (process.env.NODE_ENV === undefined ? '' : ('.' + process.env.NODE_ENV)) + '.json'));
var logger		= reqlocal('/server/boot/winston.js').logger;

var bcrypt;
try {
	// Try the native module first
	bcrypt = require('bcrypt');
	// Browserify returns an empty object
	if (bcrypt && typeof bcrypt.compare !== 'function') {
		bcrypt = require('bcryptjs');
	}
} catch (err) {
	// Fall back to pure JS impl
	bcrypt = require('bcryptjs');
}

var SALT_WORK_FACTOR = 10;
var MAX_PASSWORD_LENGTH = 72;
var HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 30; 
var YEAR_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 365;



function makeOptions() {
	var options			= {};
	options.type		= 'email';
	options.protocol	= 'http';
	options.host		= config.nginxhost;	//(app && app.get('host')) || 'localhost';
	options.port		= config.nginxport;	//(app && app.get('port')) || 3000;
	options.displayPort = (
		(options.protocol === 'http' && options.port == '80') ||
		(options.protocol === 'https' && options.port == '443')
	) ? '' : ':' + options.port;
	options.from		= config.mailProvider.auth.user;
	//options.redirect= '/verified';
	options.appName		= config.appName;
	options.headers		= options.headers || {};
	return options;
}

function createTemplatedEmailBody(options, cb) {
	var template = loopback.template(options.template);
	var body = template(options);
	cb(null, body);
}


function getUser(tokenId, thisUser, cb) {
	thisUser.relations.accessTokens.modelTo.findById(tokenId, function(err, accessToken) {
		if (err) {
			cb(err, null);
		} else if (accessToken) {
			thisUser.findById(accessToken.userId, function(err, user) {
				if (err) {
					debug('An error is reported from User.findById: %j', err);
					cb(err, null);
				} else if (user) {
					cb(null, user, accessToken);
				} else {
					var err2 = new Error(g.f('getUser failed'));
					err2.statusCode = 401;
					err2.code = 'GET_USER_FAILED';
					debug('No matching record is found for user %s', accessToken.userId);
					cb(err2, null);
				}
			});
		} else {
			var err2 = new Error(g.f('identification failed'));
			err2.statusCode = 401;
			err2.code = 'IDENTIFICATION_FAILED';
			debug('An error is reported from AccessTokens.findById: %j', err2);
			cb(err2, null);
		}
	});
}



module.exports = function (Admin) {

	
	Admin.validatesInclusionOf('onlineStatus', {in: ['online', 'away', 'offline']});

	// https://loopback.io/doc/en/lb3/Authentication-authorization-and-permissions.html
	Admin.disableRemoteMethodByName('upsert');                               // disables PATCH /Admins
	Admin.disableRemoteMethodByName('find');                                 // disables GET /Admins
	Admin.disableRemoteMethodByName('replaceOrCreate');                      // disables PUT /Admins
	Admin.disableRemoteMethodByName('create');                               // disables POST /Admins

	Admin.disableRemoteMethodByName('prototype.updateAttributes');           // disables PATCH /Admins/{id}
	Admin.disableRemoteMethodByName('findById');                             // disables GET /Admins/{id}
	Admin.disableRemoteMethodByName('exists');                               // disables HEAD /Admins/{id}
	Admin.disableRemoteMethodByName('replaceById');                          // disables PUT /Admins/{id}
	Admin.disableRemoteMethodByName('deleteById');                           // disables DELETE /Admins/{id}

	Admin.disableRemoteMethodByName('prototype.__get__accessTokens');        // disable GET /Admins/{id}/accessTokens
	Admin.disableRemoteMethodByName('prototype.__create__accessTokens');     // disable POST /Admins/{id}/accessTokens
	Admin.disableRemoteMethodByName('prototype.__delete__accessTokens');     // disable DELETE /Admins/{id}/accessTokens

	Admin.disableRemoteMethodByName('prototype.__findById__accessTokens');   // disable GET /Admins/{id}/accessTokens/{fk}
	Admin.disableRemoteMethodByName('prototype.__updateById__accessTokens'); // disable PUT /Admins/{id}/accessTokens/{fk}
	Admin.disableRemoteMethodByName('prototype.__destroyById__accessTokens');// disable DELETE /Admins/{id}/accessTokens/{fk}

	Admin.disableRemoteMethodByName('prototype.__count__accessTokens');      // disable  GET /Admins/{id}/accessTokens/count

	Admin.disableRemoteMethodByName('prototype.verify');                     // disable POST /Admins/{id}/verify
	Admin.disableRemoteMethodByName('changePassword');                       // disable POST /Admins/change-password
	Admin.disableRemoteMethodByName('createChangeStream');                   // disable GET and POST /Admins/change-stream

	Admin.disableRemoteMethodByName('confirm');                              // disables GET /Admins/confirm
	Admin.disableRemoteMethodByName('count');                                // disables GET /Admins/count
	Admin.disableRemoteMethodByName('findOne');                              // disables GET /Admins/findOne

	//Admin.disableRemoteMethodByName('login');                                // disables POST /Admins/login
	//Admin.disableRemoteMethodByName('logout');                               // disables POST /Admins/logout

	Admin.disableRemoteMethodByName('resetPassword');                        // disables POST /Admins/reset
	Admin.disableRemoteMethodByName('setPassword');                          // disables POST /Admins/reset-password
	Admin.disableRemoteMethodByName('update');                               // disables POST /Admins/update
	Admin.disableRemoteMethodByName('upsertWithWhere');                      // disables POST /Admins/upsertWithWhere


	Admin.setOnlineStatus = function (accessToken, status, cb) {
		Admin.findById(accessToken.userId, function (err, user) {
			if (err && (typeof cb === 'function')) return cb(err, null);
			if (user) {
				user.updateAttributes({
					dateLastVisit: new Date().getTime(),
					onlineStatus: status
				}, function (err, user) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (typeof cb === 'function') return cb(null, user);
				});
			} else {
				err = new Error(g.f('Could not find userId {{accessToken.userId}}'));
				err.status = 404;
				if (typeof cb === 'function') return cb(err, null);
			}
		});
	};

	Admin.setOnlineStatusById = function (userId, status, cb) {
		Admin.findById(userId, function (err, user) {
			if (err && (typeof cb === 'function')) return cb(err, null);
			if (user) {
				user.updateAttributes({
					dateLastVisit: new Date().getTime(),
					onlineStatus: status
				}, function (err) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (typeof cb === 'function') return cb(null, user);
				});
			} else {
				err = new Error(g.f('Could not find userId {{userId}}'));
				err.status = 404;
				if (typeof cb === 'function') return cb(err, null);
			}
		});
	};

	Admin.setOnlineStatusByTokenId = function (tokenId, status, cb) {
		var mAccessToken = Admin.app.models.AccessToken;
		mAccessToken.findById(tokenId, function(err, accessToken) {
			if (err) {
				cb(err, null);
			} else if (accessToken) {
				Admin.findById(accessToken.userId, function(err, user) {
					if (err && (typeof cb === 'function')) return cb(err, null);
					if (user) {
						user.updateAttributes({
							dateLastVisit: new Date().getTime(),
							onlineStatus: status
						}, function (err) {
							if (err && (typeof cb === 'function')) return cb(err, null);
							if (typeof cb === 'function') return cb(null, user);
						});
					} else {
						err = new Error(g.f('Could not find userId {{userId}}'));
						err.status = 404;
						if (typeof cb === 'function') return cb(err, null);
					}
				});
			} else {
				err = new Error(g.f('identification failed'));
				err.statusCode = 401;
				err.code = 'IDENTIFICATION_FAILED';
				debug('An error is reported from setOnlineStatusByTokenId: %j', err);
				cb(err, null);
			}
		});
	}

	Admin.getOnlineStatus = function (userId, cb) {
		Admin.findById(userId, function (err, user) {
			if (err) cb(err, null);
			if (user) {
				var status = user.onlineStatus;
				if (status ==='online') {
					if (user.dateLastVisit ) {
						var dateLastVisit = new Date(user.dateLastVisit).getTime();
						var now = new Date().getTime();
						if (now > dateLastVisit + 1000*60 )
							status = 'away';
					}
				}
				cb(null, status);
			} else {
				cb(null, 'offline');
			}
		});
	};


    Admin.getOnlineStatuses = function(tokenId, userId, fn) {
		fn = fn || utils.createPromiseCallback();
		var err;
	/*	if (!tokenId) {
			err = new Error(g.f('{{tokenId}} is required to get Online Statuses'));
			err.status = 401;
			process.nextTick(fn, err);
			return fn.promise;
		}
	*/	if (!userId) {
			err = new Error(g.f('{{userId}} is required to get Online Statuses'));
			err.status = 400;
			process.nextTick(fn, err);
			return fn.promise;
		}
		Admin.find({}, function (err, users) {
			if (err) return fn(err);
			var statuses = {};
			var now = new Date().getTime();
			users.forEach(function(user){
				var status = user.onlineStatus;
				if (status ==='online') {
					if (user.dateLastVisit ) {
						var dateLastVisit = new Date(user.dateLastVisit).getTime();
						if (now > dateLastVisit + 1000*60 )	status = 'away';
					}
				}
				statuses[user.id] = status;
			});
			fn(null, statuses);
		});	
		return fn.promise;
	};

    Admin.remoteMethod( 'getOnlineStatuses', {
		description: 'Reports online status of this user',
		accepts: [
					{arg: 'access_token', type: 'string', http: function(ctx) {
						var req = ctx && ctx.req;
						var accessToken = req && req.accessToken;
						var tokenID = accessToken ? accessToken.id : undefined;
						return tokenID;
					}, 
					description: 'Do not supply this argument, it is automatically extracted from request headers.'
					},
					{ arg: 'userId', type: 'string', required: true, description: 'id of user' }
				],
		returns: { arg: 'statuses', type: 'object', root: true	},
		http: {verb: 'POST'}
	});	


	Admin.getDashboard = function (accessToken, cb) {
		var Robot = User.app.models.Robot;
		var Strategy = User.app.models.Strategy;
		var Message = User.app.models.Message;

		Admin.findById(accessToken.userId, function (err, user) {
			if (err) return cb(err, null);
			var settings = user.settings || {};
			settings.currentMenu = 'profile';
			user.updateAttributes({	dateLastVisit:new Date().getTime(), settings: settings });	
			if (user.isAdmin) {
				//return res.redirect('/dashboard-adm?access_token='+token.id);
				async.parallel({
					user: function (acb) {
						User.find({ where: { id: user.id }, include: { relation: 'robots', scope: { include: { relation: 'strategies' } } } }, function (err, users) {
							if (err) return acb(err, null);
							acb(null, users);
						});
					},
					users: function (acb) {
						User.find({}, function (err, users) {
							if (err) return acb(err, null);
							acb(null, users);
						});
					},
					strategies: function (acb) {
						Strategy.find({}, function (err, strategies) {
							if (err) return acb(err, null);
							acb(null, strategies);
						});
					}
				}, function (err, results) {
					if (err) return cb(err, null);
					cb(null, 'dashboard', {
						admin: true,
						accessToken: accessToken.id,
						appName: config.appName,
						user: results.user[0].toJSON(),
						users: results.users,
						strategies: results.strategies
					});
				});
			} else {
				//return res.redirect('/dashboard?access_token='+token.id);
				async.parallel({
					user: function (acb) {
						User.find({ where: { id: user.id }, include: { relation: 'robots', scope: { include: { relation: 'strategies' } } } }, function (err, users) {
							if (err) return acb(err, null);
							acb(null, users);
						});
					}
				}, function (err, results) {
					if (err) return cb(err, null);
					cb(null, 'dashboard', {
						admin: false,
						accessToken: accessToken.id,
						appName: config.appName,
						user: results.user[0].toJSON()
					});
				});

			}
		});
	};

	

	
	Admin.setActive = function (tokenId, userId, active, fn) {
		fn = fn || utils.createPromiseCallback();
		var err;
		if (!tokenId) {
			err = new Error(g.f('{{accessTokens}} is required to set setActive'));
			err.status = 401;
			process.nextTick(fn, err);
			return fn.promise;
		}
		var self = this;
		getUser(tokenId, self, function(err, user, accessToken) {
			if (err) {
				debug('An error is reported from getUser: %j', err);
				fn(err, null);
			} else if (user) { // <= the admin who sent the command

				Admin.setOnlineStatus(accessToken, 'online');

				Admin.findById(userId, function (err, user) { // <= the customer who has the active state changed
					if (err) {
						debug('An error is reported from setActive: %j', err);
						fn(err, null);
					} else {
						if (user) {
							var firstActivation = false;
							if (active && !user.accessVerified) {	// le gars n'est pas un VIP et c'est sa 1ere activation
								firstActivation = true;
								user.updateAttributes({ accessVerified: true });
		 						var options			= makeOptions();
								options.template	= path.resolve(__dirname, '../../server/views/accountActivated_email.ejs');
								options.to			= user.email;
								options.subject		= '[' + config.appName + '] Activation de votre compte';
								options.firstname	= user.prenom;
								options.verifyHref	= options.protocol + '://' + options.host + options.displayPort + '/' ;
								createTemplatedEmailBody(options, function(err, html) {
									if (err) {
										//return fn(err, null);	   SI l'envoi du mail foire, ben ... tanpis... l'activation du compte continue quand même...
									} else {
										options.html = html;
										delete options.template;		// Remove options.template to prevent rejection by certain nodemailer transport plugins.
										User.app.models.Email.send(options);
									}
								});
							}

							user.updateAttributes({
								active: active
							}, function (err, user) {
								if (err) {
									debug('An error is reported from setActive: %j', err);
									fn(err, null);
								} else {
									var mClient = User.app.models.Client;
									mClient.updateAll({userId: user.id}, {active: active}, function(err, info) {
										if (err) {
											debug('An error is reported from setActive.updateAll: %j', err);
											fn(err, null);
										} else {
											user.firstActivation = firstActivation;
											fn(null, user);
										}
									});
								}
							});
						} else {
							err = new Error(g.f('Unknown user: %s', userId));
							err.code = 'UNKNOWN_USER';
							err.statusCode = 422;
							debug('An error is reported from setActive: %j', err);
							fn(err, null);
						}	
					}
				});
			} else {
				var err2 = new Error(g.f('identification failed'));
				err2.statusCode = 401;
				err2.code = 'IDENTIFICATION_FAILED';
				debug('An error is reported from getSessions: %j', err);
				fn(err2, null);
			}
		});		
		return fn.promise;
	};
	Admin.remoteMethod( 'setActive', {
		description: 'Set account\'s active state',
		accepts: [
					{arg: 'access_token', type: 'string', http: function(ctx) {
						var req = ctx && ctx.req;
						var accessToken = req && req.accessToken;
						var tokenID = accessToken ? accessToken.id : undefined;
						return tokenID;
					}, 
					description: 'Do not supply this argument, it is automatically extracted from request headers.'
					},
					{ arg: 'userId', type: 'string', required: true, description: 'id of user to set active state' },
					{ arg: 'active', type: 'boolean', required: true, description: 'the state' }
				],
		returns: {
			arg: 'user', type: 'object', root: true
		},
		http: {verb: 'POST'}
	});	



	var UPPERCASE_RE = /([A-Z])/g;
	var LOWERCASE_RE = /([a-z])/g;
	var NUMBER_RE = /([\d])/g;
	var SPECIAL_CHAR_RE = /([\?\.\/\§\,\;\:\!\-])/g;
	var NON_REPEATING_CHAR_RE = /([\w\d\?\.\/\§\,\;\:\!\-])\1{2,}/g;
	Admin.checkPassword = function (password) {
	//function isStrongEnough(password) {
		var uc = password.match(UPPERCASE_RE);
		var lc = password.match(LOWERCASE_RE);
		var n = password.match(NUMBER_RE);
		var sc = password.match(SPECIAL_CHAR_RE);
		var nr = password.match(NON_REPEATING_CHAR_RE);	//same character repeated 3 or more times consecutively

		var _ma = password.length <= config.passwordStrength.maxLength;
		var _mi = password.length >= config.passwordStrength.minLength;
		var _nr = !nr;
		var _uc = uc && uc.length >= config.passwordStrength.uppercaseMinCount;
		var _lc = lc && lc.length >= config.passwordStrength.lowercaseMinCount;
		var _n  = n && n.length >= config.passwordStrength.numberMinCount;
		var _sc = sc && sc.length >= config.passwordStrength.specialMinCount;

		return  {'ok':	_ma && _mi && _nr && _uc && _lc && _n && _sc,
				 'ma':	_ma,
				 'mi':	_mi,
				 'uc':	_uc,
				 'lc':	_lc,
				 'n' :	_n,
				 'sc':	_sc,
				 'nr':	_nr
		}
	}


	Admin.createPassword = function () {
		var password = '';
		var randomLength = Math.floor(Math.random() * (config.passwordStrength.maxLength - config.passwordStrength.minLength)) + config.passwordStrength.minLength;
		do {
			password = passGen(randomLength, false, /[\w\d\?\-]/);
		} while (!(/*isStrongEnough*/ Admin.checkPassword(password).ok));
		return password;
	};


	/*!
	 * Hash the plain password
	 */
	Admin.hashPassword = function (plain) {
		this.validatePassword(plain);
		var salt = bcrypt.genSaltSync(this.settings.saltWorkFactor || SALT_WORK_FACTOR);
		return bcrypt.hashSync(plain, salt);
	};

	Admin.validatePassword = function (plain) {
		var err;
		if (plain && typeof plain === 'string' && plain.length <= MAX_PASSWORD_LENGTH) {
			return true;
		}
		if (plain.length > MAX_PASSWORD_LENGTH) {
			err = new Error(g.f('Password too long: %s', plain));
			err.code = 'PASSWORD_TOO_LONG';
		} else {
			err = new Error(g.f('Invalid password: %s', plain));
			err.code = 'INVALID_PASSWORD';
		}
		err.statusCode = 422;
		throw err;
	};



	/*
		Le user clique sur le lien de verif du mail.
		on checke le token pour envoyer une réponse jolie
		au lieu d'une erreur (loopback/comon/model/user.js#882)
	*/
	Admin.beforeRemote('confirm', function (context, user, next) {
		Admin.findById(context.args.uid, function (err, user) {
			if (err) return next(err);
			if (user && user.verificationToken === context.args.token) {
				return next();
			} else {
				if (user) {
				 	return context.res.render('badtoken', {
						title: 'Token incorrect',
						content: 'Ce token est invalide. Veuillez contacter votre administrateur.',
						appName: config.appName,
						redirectTo: '/',
						redirectToLinkText: 'Log in'
					  });
				}
				return next();
			}
		});
	});

	/*
		On a reçu la confirmation du mail d'enregistrement du user.
		On active son compte
	*/
	Admin.afterRemote('confirm', function (context, user, next) {
		// user is undefined

		Admin.findById(context.args.uid, function (err, usr) {
			if (err) return next(err);

			var pass = usr.repassword;	//User.createPassword();
			var hash = usr.password;	//User.hashPassword(pass);
			var uid = uuidV1();
			var userid = (typeof usr.id === 'object') ? usr.id.toString() : usr.id;
			
			if (usr.accessVerified) {	// le gars est un VIP

				// on lui active son compte
				usr.updateAttributes({
					active: true,
					repassword: ''
				}, function (err, user) {
					if (err) throw err;	
					
				});

				return next();
			} else {					// le gars est un nouveau

				usr.updateAttributes({
					repassword: ''
				}, function (err, user) {
					
				});

				
				// send email to fabrice
				// with new user registered
				
				// $$$ TODO en fait le user ne connait pas son Robot pass en clair...
				// il faut soit :
				// - lui donner par email, bof bof
				// - ajouter une saisie sur le formulaire d'inscription
				var text = '<p>Coucou les admins,</p>'+
							'<p>Un nouvel utilisateur vient de s\'enregistrer :</p>' +
							'<ul>' +
							'<li>Prenom : ' + usr.prenom + '</li>' +
							'<li>Nom : ' + usr.nom + '</li>' +
							'<li>Email : ' + usr.email + '</li>' +
							'</ul>' +
							'<p>Son robot a été créé : </p>' +
							'<ul>' +
							'<li>Robot ID : ' + robotData.uuid + '</li>' +
							'</ul>' +
							'<p>Les Stratégies en <b>Auto-Delivery</b> lui ont été <b>délivrées</b>.<p>' +
							'<p>Son compte est toujours <b class="text-danger">Suspendu</b>. Il faudra l\'activer manuellement pour que '+ usr.prenom +' puisse se connecter.<p>' +
							'<img src="data:image/png;base64,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"></img>' +
							'<p>Cordialement, <br />' + 
							'ZenBoard</p>';
				Admin.app.models.Email.send({
					to: config.mailRecipient.adminTo,
					cc: config.mailRecipient.adminCC,
					from: config.mailProvider.auth.user,
					subject: '[' + config.appName + '] New user registered: ' + usr.prenom + ' ' + usr.nom,
				//	text: text,
					html: text
				}, function (err, mail) {
					if (err) {
						return next(err);
					}
					logger.info('> sending new user email to:' + config.mailRecipient.adminTo);
					return next();
				});
			}

		});
	});

	Admin.register = function (res, req, next) {
		if (req.body.nom === '') { return res.send({ err: 'Firstname empty' }); }
		if (req.body.prenom === '') { return res.send({ err: 'Lastname empty' }); }
		if (req.body.password === '') { return res.send({ err: 'Password empty' }); }
		if (req.body.password !== req.body.repassword) { return res.send({ err: 'Passwords do not match.' }); }

	//	User.checkAccessKey(req.body.accessname, req.body.accesskey, function (access) {
		var access = false;
		
		Admin.create({
				password: req.body.password,
				repassword: req.body.repassword,
				email: req.body.email,
				active: false,
				verificationToken: null,
				emailVerified: false,
				accessVerified: access,
				onlineStatus: 'offline',
				dateCreated: new Date().getTime(),	
				dateLastVisit: new Date().getTime()
			},
				{},
				function (err, user) {
					if (err) {
						var cause;
						if (err.details.codes.email) {
							cause = 'email.' + err.details.codes.email[0];
						}
						var message;
						switch (cause) {
							case 'email.presence': message = 'L\'Email ne peut pas être vide'; break;
							case 'email.custom.email': message = 'L\'Email est invalide'; break;
							case 'email.uniqueness': message = 'Cet Email existe déjà'; break;
							default:				message = 'Erreur inconnue'; break;
						}
						res.send({
							appName: config.appName,
							err: message
						});
					} else {
						var verifyOptions = User.getVerifyOptions();
						verifyOptions.from     = config.mailProvider.auth.user;
						verifyOptions.subject  = '[' + config.appName + '] Confirmation d\'inscription';
						verifyOptions.template = path.resolve(__dirname, '../../server/views/verify_email.ejs');
						verifyOptions.redirect = access ? '/verifiedvip' : '/verified';	//?uid='+(typeof user.id === 'object') ? user.id.toString() : user.id;
						// $$$ TODO Trouver un moyen de transmettre le userid au template "verified.ejs" qui est routé par un redirect
						// et ensuite remettre en place i18n sur "verified.ejs" et "verified.js" 
						verifyOptions.appName	= config.appName;
						verifyOptions.host		= config.nginxhost;	//(app && app.get('host')) || 'localhost';
				    	verifyOptions.port		= config.nginxport;	//(app && app.get('port')) || 3000;

						user.verify(verifyOptions, function (err, response) {
							if (err) {
								Admin.deleteById(user.id);
								return next(err);
							}
							res.render('response', {
								title: 'Inscription réussie',
								content: 'Merci de vérifier votre boite email, et de cliquer sur le lien de vérification. Une fois votre adresse email vérifiée, vous recevrez un nouveau mail de confirmation lorsque votre compte aura été activé.' ,
								redirectTo: '/login',
								redirectToLinkText: 'Connexion'
							}, function (err, html) {
								res.send(html);
							});
						});
					}
				}
			);
	//	});
	};



	//send password reset link when requested
	// je fais une version de User.prototype.verify() sans connaitre le user.
	// je n'ai que son email et un token temporaire...
	Admin.on('resetPasswordRequest', function (info) {
		var options			= makeOptions();
		options.template	= path.resolve(__dirname, '../../server/views/password_email.ejs');
		options.to			= info.email;
		options.subject		= '[' + config.appName + '] Réinitialisation du mot de passe';
		options.verifyHref	= options.protocol + '://' + options.host + options.displayPort + '/reset-password' + '?access_token=' + info.accessToken.id;
		options.text		= 'To reset your password, copy/paste this link: "' + options.verifyHref + '" to your browser.';
		createTemplatedEmailBody(options, function(err, html) {
			if (err) return logger.error('> error sending password reset email');
			options.html = html;
			delete options.template;		// Remove options.template to prevent rejection by certain nodemailer transport plugins.
			var Email = Admin.app.models.Email;
			if (Email.send.length === 3) {	// argument "options" is passed depending on Email.send function requirements
				Email.send(options, null, handleAfterSend);
			} else {
				Email.send(options, handleAfterSend);
			}

			function handleAfterSend(err, email) {
				if (err) return logger.error('> error sending password reset email');
				//cb(null, {email: email});
			}
		});
	});


};
