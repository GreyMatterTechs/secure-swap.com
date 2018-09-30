/**
 * App for SecureSwap ICO website.
 *
 * @requires	Include all of the following: Tools.js
 * @file		Dashboard.js
 * @version:	1.0.0
 * @author:		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright:	Copyright (c) 2017, GreyMatterTechs.com. All rights reserved.
 * @namespace:	ssw
 */

'use strict';

/**
 */
(function(window, undefined) {

	window.ssw = window.ssw || {};	// NameSpace

	if (window.ssw.Tools === undefined) { throw new Error('Please load Tools.js'); }

	// ---------- class Dashboard

	// --- public static

	// constructeur public static
	window.ssw.Dashboard = function() {
		throw new Error('Please use getInstance');
	};

	// singleton factory public static
	window.ssw.Dashboard.getInstance = function() {
		if (instance) { return instance; }
		instance = new Dashboard();
		return instance;
	};

	// --- private static

	// membres private static

	var instance	= null;
	

	// Constructeur private static
	var Dashboard = function() {

		// --- private members

		var teamIntervalDefault = 60000;
		var teamInterval = teamIntervalDefault;
		var teamIntervalId = null;
		var ajaxDelay;
		var tools		= null;
		var accessToken		= null;

		// --- private methods

		function updateTeam() {
			$.post('/api/Admins/getOnlineStatuses', {'access_token': accessToken})
				.done(function(users) {
					teamInterval = teamIntervalDefault;
					var colors = {online: '#eeffee', away: '#ffffee', offline: '#ffeeee'};
					var $team = $('#team').find('tbody');
					for (var u = 0; u < users.length; u++) {
						var username = users[u].username;
						var name = tools.ucfirst(username);
						var status = users[u].status;
						var color = colors[status];
						var $tr = $team.find('#team-' + username);
						$tr.css('background-color', color);
				//		$icon.attr('title', tools.ucfirst(status));
					}
				})
				.fail(function(err) {
					if (teamInterval < teamIntervalDefault * 100) teamInterval *= 2;
				});
		}
		function updateTeamTimer() {
			if (teamIntervalId) clearInterval(teamIntervalId);
			updateTeam();
			teamIntervalId = setInterval(updateTeamTimer, teamInterval);
		}

		function populateTeam() {
			$.post('/api/Admins/getOnlineStatuses', {'access_token': accessToken})
				.done(function(users) {
					var colors = {online: 'success', away: 'warning', offline: 'danger'};
					var $team = $('#team').find('tbody');
					for (var u = 0; u < users.length; u++) {
						var username = users[u].username;
						var name = tools.ucfirst(username);
						var status = users[u].status;
						var color = colors[status];
						var html =	'<tr id="team-' + username + '">' +
									'	<td' +
									'		<div class="col-12">' +
									'			<div class="row">' +
									'				<div class="col-md-2 col-xl-2 col-12 d-none d-md-block">' +
									'					<span class="avatar avatar-online">' +
									'						<img src="/assets/images/team/' + username + '.png" alt="' + username + '">' +
									'					</span>' +
									'				</div>' +
									'				<div class="col-md-10 col-xl-10 col-12">' +
									'					' + name +
									'				</div>' +
									'			</div>' +
									'		</div>' +
									'	</td>' +
									'</tr>';

					//	var html =	'<tr>' +
					//				'	<td class="text-truncate"><i id="' + 'team-' + name + '" title="' + tools.ucfirst(status) + '" class="la la-dot-circle-o ' + color + ' font-medium-1 mr-1"></i> ' + name + '</td>' +
					//				'</tr>';
						$team.append(html);
					}
				})
				.fail(function(err) {
					debugger;
				});
		}


		// --- public methods

		return {

			init: function(_ajaxDelay, _accessToken) {

				ajaxDelay = _ajaxDelay || 5000;
				teamIntervalDefault = ajaxDelay;
				accessToken = _accessToken;
				tools = window.ssw.Tools.getInstance();

				//--------------------------------------------------------------------------------------------------------------
				// Team
				//--------------------------------------------------------------------------------------------------------------

				populateTeam();
				setTimeout(function() {
					updateTeamTimer();
				}, 1000);

			} // end of init:function

		}; // end of return

	}; // end of ssw.Dashboard = function() {

	// ---------- End class Dashboard

}(window));

// window.ssw.Tools.getInstance().addEventHandler(document, 'DOMContentLoaded', window.ssw.Dashboard.getInstance().init(), false);

// EOF
