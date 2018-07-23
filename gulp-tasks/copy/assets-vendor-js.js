var gulpCopy = require('gulp-copy');

module.exports = function(gulp, callback) {
	return gulp.src(config.assets_source.vendor + '/vendors.min.js')
		.pipe(gulp.dest(config.assets_dest.vendor + '/'));
};
