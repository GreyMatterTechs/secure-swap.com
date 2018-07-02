module.exports = function(gulp, callback) {
	return gulp.watch(config.assets_source.sass+'/**/*.scss', 
					  ['assets-css']
					);
};