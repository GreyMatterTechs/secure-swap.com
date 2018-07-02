var autoprefixer = require('gulp-autoprefixer');

module.exports = function(gulp, callback) {
    return gulp.src(['**/*.css', '!**/*.min.css'], { cwd: config.assets_dest.css })
        .pipe(autoprefixer({
            browsers: config.autoprefixerBrowsers,
            cascade: false
        }))
        .pipe(gulp.dest(config.assets_dest.css));
};