var gulpCopy = require('gulp-copy');

module.exports = function(gulp, callback) {
	return gulp.src(config.assets_source.js+'/**/*.js')
		.pipe(gulp.dest(config.assets_dest.js));
};