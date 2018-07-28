var gulpCopy = require('gulp-copy');
var concat = require('gulp-concat');

module.exports = function(gulp, callback) {

	return gulp.src(
                ['**/*.min.js', '!*.min.js'], { cwd: config.assets_source.vendor }
        )
        .pipe(concat('vendors.min.js'))             				    //output file
        .pipe(gulp.dest(config.assets_source.vendor + '/'));

};
