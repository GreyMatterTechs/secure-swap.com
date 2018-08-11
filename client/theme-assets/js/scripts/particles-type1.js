/**
*   File Name: template-3d-graphics-default.js
*   Description: Particles js.
*   ----------------------------------------------------------------------------------------
**/

'use strict';

(function(window, document, $) {

	var $html = $('html');
	var $body = $('body');

	// Particle JS
	particlesJS('particles-js', {
		'particles': {
			'number': {
				'value': 10,
				'density': {
					'enable': true,
					'value_area': 500
				}
			},
			'color': {
				'value': '#567bc1'
			},
			'shape': {
				'type': 'circle'
			},
			'opacity': {
				'value': 0.3,
				'random': true,
				'anim': {
					'enable': true,
					'speed': 0.5,
					'opacity_min': 0.1,
					'sync': false
				}
			},
			'size': {
				'value': 7,
				'random': true,
				'anim': {
					'enable': true,
					'speed': 0.3,
					'size_min': 3,
					'sync': false
				}
			},
			'line_linked': {
				'enable': true,
				'distance': 500,
				'color': '#567bc1',
				'opacity': 0.2,
				'width': 1
			},
			'move': {
				'enable': true,
				'speed': 0.35
			}
		},
		'interactivity': {
			'detect_on': 'canvas',
			'events': {
				'onhover': {
					'enable': false
				},
				'onclick': {
					'enable': false
				},
				'resize': true
			}
		},
		'retina_detect': true,
		'config_demo': {
			'hide_card': false
		}
	}
	);

	var updateICOIntervalId = null;
	function updateParticles() {
		if (updateICOIntervalId) clearInterval(updateICOIntervalId);
		particlesJS.getDom(function (pJSDom) {
			if (pJSDom[0]) {
				var nb = Math.floor(Math.random() * 8) + 1;
				pJSDom[0].pJS.fn.modes.pushParticles(nb);
				pJSDom[0].pJS.fn.modes.removeParticles(nb);
			}
		});
		var updateICOInterval = (Math.floor(Math.random() * 5) + 1) * 1000;
		updateICOIntervalId = setInterval(updateParticles, updateICOInterval);
	}
	setTimeout(function () {
		updateParticles();
	}, 3000);


})(window, document, jQuery);
