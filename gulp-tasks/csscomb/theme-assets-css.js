var csscomb = require('gulp-csscomb');

module.exports = function(gulp, callback) {
	return gulp.src( ['**/*.css', '!**/*.min.css'], { cwd: config.theme_assets_dest.css } )
		.pipe(csscomb())
		.pipe(gulp.dest(config.theme_assets_dest.css));
};