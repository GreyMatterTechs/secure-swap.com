'use strict';

// http://www.outfox.com/do-not-track-for-google-analytics/

function providePlugin(pluginName, pluginConstructor) {
	var ga = window[window.GoogleAnalyticsObject || 'ga'];
	if (typeof ga == 'function') {
		ga('provide', pluginName, pluginConstructor);
	}
}
var analyticsDNT = function(tracker, config) {
	var logStatus = config.logStatus,
		isSet = !1,
		dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;

	!dnt || 'yes' != dnt && '1' != dnt || (isSet = !0);

	if (config.debug)
		console.log('analyticsDNT: plugin enabled for path: ' + config.path + ' on tracker: ' + tracker.get('name') + ' - navigator DNT:' + isSet);

	logStatus && tracker.set(logStatus, isSet ? 'dnt' : '(not set)');

	var originalBuildHitTask = tracker.get('buildHitTask');
	tracker.set('buildHitTask', function(model) {
		if (config.debug)
			console.log('analyticsDNT Hit: isSet=' + isSet + ' logStatus=' + logStatus);
		if (isSet && !logStatus) throw 'dnt';
		originalBuildHitTask(model);
	});
};
providePlugin('ga-dnt', analyticsDNT);
