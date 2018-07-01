module.exports = function(gulp, callback) {
	return gulp.watch(config.theme_assets_source.sass+'/**/*.scss', 
					  ['theme-assets-sass-compile']
					);
};