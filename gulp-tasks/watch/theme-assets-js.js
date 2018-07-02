module.exports = function(gulp, callback) {
	return gulp.watch(config.theme_assets_source.js+'/**/*.js', 
					  ['theme-assets-js']
					);
};