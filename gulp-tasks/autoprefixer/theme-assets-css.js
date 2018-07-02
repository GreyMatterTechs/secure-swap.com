var autoprefixer = require('gulp-autoprefixer');

module.exports = function(gulp, callback) {
    return gulp.src(['**/*.css', '!**/*.min.css'], { cwd: config.theme_assets_dest.css })
        .pipe(autoprefixer({
            browsers: config.autoprefixerBrowsers,
            cascade: false
        }))
        .pipe(gulp.dest(config.theme_assets_dest.css));
};