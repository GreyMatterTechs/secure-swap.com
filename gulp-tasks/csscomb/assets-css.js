var csscomb = require('gulp-csscomb');

module.exports = function(gulp, callback) {
	return gulp.src( ['**/*.css', '!**/*.min.css'], { cwd: config.assets_dest.css } )
		.pipe(csscomb())
		.pipe(gulp.dest(config.assets_dest.css));
};