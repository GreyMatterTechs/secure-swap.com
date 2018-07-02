var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

module.exports = function(gulp, callback) {
    return gulp.src(['**/*.css', '!**/*.min.css'], { cwd: config.theme_assets_dest.css })
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.theme_assets_dest.css));
};