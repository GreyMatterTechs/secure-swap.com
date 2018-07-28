var gulpCopy = require('gulp-copy');
var concat = require('gulp-concat');

module.exports = function(gulp, callback) {

	return gulp.src(
                ['**/*.min.css', '!*.min.css'], { cwd: config.assets_source.vendor }
        )
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest(config.assets_source.vendor + '/'));

};
