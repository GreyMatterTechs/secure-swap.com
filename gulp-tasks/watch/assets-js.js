module.exports = function(gulp, callback) {
	return gulp.watch(config.assets_source.js+'/**/*.js', 
					  ['assets-js']
					);
};