// Require the modules.
var gulp             = require('gulp');
var gutil            = require('gulp-util');
var gulpSequence     = require('gulp-sequence');
var gulpRequireTasks = require('gulp-require-tasks');
var minimist         = require('minimist');
var config           = require('./gulpconfig.json');

var options          = minimist(process.argv.slice(2));

// Global Variables
global.config          = config;
global.rtl             = '';

if (options.TextDirection !== undefined){
	global.myTextDirection = options.TextDirection.toLowerCase();
	if (myTextDirection == 'rtl')
		rtl = '-rtl';
}
else{
	global.myTextDirection = '';
}

gutil.log(gutil.colors.green('Starting Gulp!!'));


// Invoke the module with options.
gulpRequireTasks({

	// Specify path to your tasks directory.
	path: process.cwd() + '/gulp-tasks' // This is default!

	// Additionally pass any options to it from the table below.
	// ...
	// path	- './gulp-tasks'	Path to directory from which to load your tasks modules
	// separator -	:	Task name separator, your tasks would be named, e.g. foo:bar:baz for ./tasks/foo/bar/baz.js
	// arguments -	[]	Additional arguments to pass to your task function
	// passGulp	- true	Whether to pass Gulp instance as a first argument to your task function
	// passCallback -	true	Whether to pass task callback function as a last argument to your task function
	// gulp	- require('gulp')	You could pass your existing Gulp instance if you have one, or it will be required automatically

});

// Clean Task.
// Clean js and css folders from theme-assets.
gulp.task('dist-theme-assets-clean', ['clean:theme-assets-css', 'clean:theme-assets-js']);
gulp.task(      'dist-assets-clean', ['clean:assets-css',       'clean:assets-js']);

// Full Clean Task.
// Clean js and css folders from assets and theme-assets folders.
gulp.task('dist-clean', ['dist-theme-assets-clean', 'dist-assets-clean']);

// SASS Compile Task.
// Compile core, main(app), pages and plugins scss files.
gulp.task('theme-assets-sass-compile', ['sass:theme-assets-main', 'sass:theme-assets-pages', 'sass:theme-assets-plugins']);
gulp.task(      'assets-sass-compile', ['sass:assets-style']);

// Full Compiling Task.
// Compile core, main(app), pages and plugins scss files from assets and theme-assets folders.
gulp.task('sass-compile', ['theme-assets-sass-compile', 'assets-sass-compile']);



// CSS Distribution Task.
// Clean css folder, compile all scss files, auto prefix them, organize them and finally minify them in theme-assets/css folder.
gulp.task('theme-assets-css', gulpSequence('clean:theme-assets-css', 'theme-assets-sass-compile', 'autoprefixer:theme-assets-css', 'csscomb:theme-assets-css', 'cssmin:theme-assets-css', 'notify:theme-assets-css'));
gulp.task(      'assets-css', gulpSequence('clean:assets-css',       'assets-sass-compile',       'autoprefixer:assets-css',       'csscomb:assets-css',       'cssmin:assets-css',       'notify:assets-css'));

// JS Distribution Task.
// Gulp task to clean js folder from theme-assets, copy js files from src folder and minify them.
gulp.task('theme-assets-js', gulpSequence('clean:theme-assets-js', 'copy:theme-assets-js', 'uglify:theme-assets-min', 'notify:theme-assets-js'));
gulp.task(      'assets-js', gulpSequence('clean:assets-js',       'copy:assets-js',       'uglify:assets-min',       'notify:assets-js'));

// Full Distribution Task.
// Gulp task to generate css and js files in theme-assets folder.
gulp.task('dist', ['theme-assets-css', 'theme-assets-js', 'assets-css', 'assets-js']);

// Default Task.
gulp.task('default', ['dist']);


// Monitor changes for both pug and sass files.
// Watch all scss and pug files change and compile it accordingly. In this command you need to pass the Layout, LayoutName & TextDirection.
gulp.task('monitor', gulpSequence('watch:theme-assets-css', 'watch:theme-assets-js', 'watch:assets-css', 'watch:assets-js'));
//gulp.task(      'assets-monitor', gulpSequence('sass:assets-watch-css',       'sass:assets-watch-js'));

gulp.task('monitor', function() {
	gulp.watch(config.assets_source.sass+'/**/*.scss', ['sass:assets-style']);
	gulp.watch(config.assets_source.js+'/**/*.js', ['copy:assets-js']);
  });



// Full Monitoring Task.
// Monitor changes for both pug and sass files from assets and theme-assets folders.
//gulp.task('monitor', 'theme-assets-monitor', 'assets-monitor']);

