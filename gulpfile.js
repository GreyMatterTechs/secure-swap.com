// Require the modules.
var gulp             = require('gulp');
var gutil            = require('gulp-util');
var gulpSequence     = require('gulp-sequence');
var gulpRequireTasks = require('gulp-require-tasks');
var minimist         = require('minimist');
var config           = require('./config.json');

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
gulp.task('dist-clean', ['clean:css', 'clean:js']);

// Monitor changes for both pug and sass files.
// Watch all scss and pug files change and compile it accordingly. In this command you need to pass the Layout, LayoutName & TextDirection.
gulp.task('monitor', gulpSequence('sass:watch'));

// JS Distribution Task.
// Gulp task to clean js folder from theme-assets, copy js files from src folder and minify them.
gulp.task('dist-js', gulpSequence('clean:js', 'copy:js', 'uglify:min', 'notify:js'));

// SASS Compile Task.
// Compile core, main(app), pages and plugins scss files.
gulp.task('sass-compile', ['sass:main', 'sass:pages', 'sass:plugins', 'sass:style']);

// CSS Distribution Task.
// Clean css folder, compile all scss files, auto prefix them, organize them and finally minify them in theme-assets/css folder.
gulp.task('dist-css', gulpSequence('clean:css', 'sass-compile', 'autoprefixer:css', 'csscomb:css', 'cssmin:css', 'notify:css'));

// Full Distribution Task.
// Gulp task to generate css and js files in theme-assets folder.
gulp.task('dist', ['dist-css', 'dist-js']);

// Default Task.
gulp.task('default', ['dist']);