'use strict';

// http://www.outfox.com/do-not-track-for-google-analytics/

function providePlugin(pluginName, pluginConstructor) {
	console.log('gaDnt: providePlugin()');
	var ga = window[window.GoogleAnalyticsObject || 'ga'];
	if (typeof ga == 'function') {
		console.log('gaDnt: ga(provide) pluginName=' + pluginName);
		ga('provide', pluginName, pluginConstructor);
	}
}

var gaDnt = function(tracker, config) {
	console.log('gaDnt: plugin. Constructor');
	this.tracker = tracker;
	this.logStatus = config.logStatus;
	this.debug = config.debug;
	this.path = config.path;
	this.isSet = !1;
	this.dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
	!this.dnt || 'yes' != this.dnt && '1' != this.dnt || (this.isSet = !0);
};

gaDnt.prototype.updateTracker = function() {
	// if (config.debug)
	console.log('gaDnt: plugin enabled for path: ' + this.path + ' on tracker: ' + this.tracker.get('name') + ' - navigator DNT:' + this.isSet);

	this.logStatus && this.tracker.set(this.logStatus, this.isSet ? 'dnt' : '(not set)');

	var originalBuildHitTask = this.tracker.get('buildHitTask');
	var self = this;
	console.log('gaDnt: set buildHitTask');
	this.tracker.set('buildHitTask', function(model) {
		console.log('gaDnt Hit: isSet=' + self.isSet + ' logStatus=' + self.logStatus);
		if (self.isSet && !self.logStatus) {
			console.log('gaDnt Hit throw error');
			throw 'dnt';
		}
		console.log('gaDnt: call original buildHitTask');
		originalBuildHitTask(model);
	});
};

providePlugin('gaDnt', gaDnt);
