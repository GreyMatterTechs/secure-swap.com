var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

module.exports = function(gulp, callback) {
    return gulp.src(['**/*.css', '!**/*.min.css'], { cwd: config.assets_dest.css })
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.assets_dest.css));
};