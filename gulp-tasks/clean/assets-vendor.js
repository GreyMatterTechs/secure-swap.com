var clean = require('gulp-clean');

module.exports = function(gulp, callback) {
	return gulp.src(config.assets_dest.vendor, {
		read: false
	})
	.pipe(clean());
};
