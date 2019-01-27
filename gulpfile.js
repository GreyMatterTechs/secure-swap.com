/**
 * Gulp tasks and watches.
 *
 * @file		This file defines Gulp tasks.
 * @author		Philippe Aubessard
 * @link        http://secure-swap.com
 * @copyright	Copyright (c) 2018, GreyMatterTechs.com. All Rights Reserved.
 */

'use strict';

// ------------------------------------------------------------------------------------------------------
// includes
// ------------------------------------------------------------------------------------------------------

const gulp			= require('gulp'),
	  sass			= require('gulp-sass'),
	  autoprefixer	= require('gulp-autoprefixer'),
	  cssnano		= require('gulp-cssnano'),
	  // jshint		= require('gulp-jshint'),
	  uglify		= require('gulp-uglify-es').default,
	  // imagemin	= require('gulp-imagemin'),
	  rename		= require('gulp-rename'),
	  concat		= require('gulp-concat'),
	  notify		= require('gulp-notify'),
	  cache			= require('gulp-cache'),
	  livereload	= require('gulp-livereload'),
	  jsonminify	= require('gulp-jsonminify'),
	  del			= require('del'),
	  config		= require('./gulpconfig.json');

var supported = [
	'last 2 versions',
	'safari >= 8',
	'ie >= 10',
	'ff >= 20',
	'ios 6',
	'android 4'
];


// ------------------------------------------
// CSS Distribution Task.
// ------------------------------------------

gulp.task('styles-assets', function() {
	return gulp.src(config.assets_source.sass + '/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(config.assets_dest.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano({zindex: false, autoprefixer: {browsers: supported, add: true}}))
		.pipe(gulp.dest(config.assets_dest.css))
		.pipe(notify({message: 'Assets Styles task complete'}));
});
gulp.task('styles-theme-assets', function() {
	return gulp.src(['template-counter.scss', 'template-3d-graphics.scss', 'template-3d-animation.scss', 'template-intro-video.scss', 'bootstrap.scss'], {cwd: config.theme_assets_source.sass})
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(config.theme_assets_dest.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano({zindex: false, autoprefixer: {browsers: supported, add: true}}))
		.pipe(gulp.dest(config.theme_assets_dest.css))
		.pipe(notify({message: 'Theme-Assets Styles task complete'}));
});
gulp.task('styles-extranet-assets', function() {
	return gulp.src(config.extranet_assets_source.sass + '/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(config.extranet_assets_dest.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano({zindex: false, autoprefixer: {browsers: supported, add: true}}))
		.pipe(gulp.dest(config.extranet_assets_dest.css))
		.pipe(notify({message: 'Extranet Assets Styles task complete'}));
});

// ------------------------------------------
// JS Distribution Task.
// ------------------------------------------

gulp.task('scripts-assets', function() {
	return gulp.src(config.assets_source.js + '/**/*.js')
		// .pipe(jshint('.jshintrc'))
		// .pipe(jshint.reporter('default'))
		// .pipe(concat('main.js'))
		.pipe(gulp.dest(config.assets_dest.js))
		.pipe(rename({suffix: '.min'}))
		//  only uglify if gulp is ran with '--type production'
		// .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(uglify())
		.pipe(gulp.dest(config.assets_dest.js))
		.pipe(notify({message: 'Assets Scripts task complete'}));
});
gulp.task('scripts-theme-assets', function() {
	return gulp.src(config.theme_assets_source.js + '/**/*.js')
		// .pipe(jshint('.jshintrc'))
		// .pipe(jshint.reporter('default'))
		// .pipe(concat('main.js'))
		.pipe(gulp.dest(config.theme_assets_dest.js))
		.pipe(rename({suffix: '.min'}))
		//  only uglify if gulp is ran with '--type production'
		// .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(uglify())
		.pipe(gulp.dest(config.theme_assets_dest.js))
		.pipe(notify({message: 'Theme-Assets Scripts task complete'}));
});
gulp.task('scripts-extranet-assets', function() {
	return gulp.src(config.extranet_assets_source.js + '/**/*.js')
		// .pipe(jshint('.jshintrc'))
		// .pipe(jshint.reporter('default'))
		// .pipe(concat('main.js'))
		.pipe(gulp.dest(config.extranet_assets_dest.js))
		.pipe(rename({suffix: '.min'}))
		//  only uglify if gulp is ran with '--type production'
		// .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(uglify())
		.pipe(gulp.dest(config.extranet_assets_dest.js))
		.pipe(notify({message: 'Extranet-Assets Scripts task complete'}));
});

// ------------------------------------------
// Vendor Distribution Task.
// ------------------------------------------

gulp.task('styles-vendor-assets', function() {
	return gulp.src(['**/*.min.css'], {cwd: config.assets_source.vendor})
		.pipe(concat('vendors.min.css'))
		.pipe(gulp.dest(config.assets_dest.vendor))
		.pipe(notify({message: 'Vendors Assets Styles task complete'}));
});
gulp.task('styles-vendor-theme-assets', function() {
	return gulp.src(['**/*.min.css'], {cwd: config.theme_assets_source.vendor})
		.pipe(concat('vendors.min.css'))
		.pipe(gulp.dest(config.theme_assets_dest.vendor))
		.pipe(notify({message: 'Vendors Theme-Assets Styles task complete'}));
});
gulp.task('styles-vendor-extranet-assets', function() {
	return gulp.src(['**/*.css', '!**/*.min.css'], {cwd: config.extranet_assets_source.vendor})
		.pipe(concat('vendors.css'))
		.pipe(gulp.dest(config.extranet_assets_dest.vendor))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano({ zindex: false, autoprefixer: {browsers: supported, add: true}}))
		.pipe(gulp.dest(config.extranet_assets_source.vendor))
		.pipe(concat('vendors.min.css'))
		.pipe(gulp.dest(config.extranet_assets_dest.vendor))
		.pipe(notify({message: 'Vendors Extranet Assets Styles task complete'}));
});

gulp.task('scripts-vendor-assets', function() {
	return gulp.src(['**/*.min.js'], {cwd: config.assets_source.vendor})
		.pipe(concat('vendors.min.js'))
		.pipe(gulp.dest(config.assets_dest.vendor))
		.pipe(notify({message: 'Vendors Assets Scripts task complete'}));
});
gulp.task('scripts-vendor-theme-assets', function() {
	// return gulp.src(['**/*.min.js'], {cwd: config.theme_assets_source.vendor})
		// .pipe(concat('vendors.min.js'))
		// .pipe(gulp.dest(config.theme_assets_dest.vendor))
		// .pipe(notify({message: 'Vendors Theme-Assets Scripts task complete'}));
	return gulp.src(['**/*.js', '!**/*.min.js'], {cwd: config.theme_assets_source.vendor})
		.pipe(concat('vendors.js'))
		.pipe(gulp.dest(config.theme_assets_dest.vendor))
		.pipe(rename({suffix: '.min'}))
		//  only uglify if gulp is ran with '--type production'
		// .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(uglify())
		.pipe(concat('vendors.min.js'))
		.pipe(gulp.dest(config.theme_assets_dest.vendor))
		.pipe(notify({message: 'Vendors Extranet Assets Scripts task complete'}));
});
gulp.task('scripts-vendor-extranet-assets', function() {
	return gulp.src(['**/*.js', '!**/*.min.js'], {cwd: config.extranet_assets_source.vendor})
		.pipe(concat('vendors.js'))
		.pipe(gulp.dest(config.extranet_assets_dest.vendor))
		.pipe(rename({suffix: '.min'}))
		//  only uglify if gulp is ran with '--type production'
		// .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
		.pipe(uglify())
		.pipe(gulp.dest(config.extranet_assets_source.vendor))
		.pipe(concat('vendors.min.js'))
		.pipe(gulp.dest(config.extranet_assets_dest.vendor))
		.pipe(notify({message: 'Vendors Extranet Assets Scripts task complete'}));
});

// ------------------------------------------
// VIP Task.
// ------------------------------------------

gulp.task('i18n-assets', function() {
	return gulp.src(['*.json'], {cwd: config.assets_source.i18n})
		.pipe(jsonminify())
		.pipe(gulp.dest(config.assets_dest.i18n))
		.pipe(notify({message: 'i18n Assets task complete'}));
});

// ------------------------------------------
// Cleaning Distribution Task.
// ------------------------------------------

gulp.task('clean-styles', function() {
	return del([config.assets_dest.css, config.theme_assets_dest.css, config.extranet_assets_dest.css]);
});
gulp.task('clean-scripts', function() {
	return del([config.assets_dest.js, config.theme_assets_dest.js, config.extranet_assets_dest.js]);
});

// ------------------------------------------
// Default Task.
// ------------------------------------------

gulp.task('default', ['clean-styles', 'clean-scripts'], function() {
	gulp.start('styles-assets', 'styles-theme-assets', 'styles-extranet-assets', 'scripts-assets', 'scripts-theme-assets', 'scripts-extranet-assets');
});


// ------------------------------------------
// Watch Tasks.
// ------------------------------------------

gulp.task('watch', function() {
	// Watch .scss files
	gulp.watch(config.assets_source.sass + '/**/*.scss', ['styles-assets']);
	gulp.watch(config.theme_assets_source.sass + '/**/*.scss', ['styles-theme-assets']);
	gulp.watch(config.extranet_assets_source.sass + '/**/*.scss', ['styles-extranet-assets']);
	// Watch .js files
	gulp.watch(config.assets_source.js + '/**/*.js', ['scripts-assets']);
	gulp.watch(config.theme_assets_source.js + '/**/*.js', ['scripts-theme-assets']);
	gulp.watch(config.extranet_assets_source.js + '/**/*.js', ['scripts-extranet-assets']);
	// Watch vendor files
	gulp.watch(config.assets_source.vendor + '/**/*.*', ['styles-vendor-assets', 'scripts-vendor-assets']);
	gulp.watch(config.theme_assets_source.vendor + '/**/*.*', ['styles-vendor-theme-assets', 'scripts-vendor-theme-assets']);
	gulp.watch(config.extranet_assets_source.vendor + '/**/*.*', ['styles-vendor-extranet-assets', 'scripts-vendor-extranet-assets']);
	// Watch VIP files
	gulp.watch(config.assets_source.i18n + '/**/*.*', ['i18n-assets']);

	// Create LiveReload server
	livereload.listen();
	// Watch any files in dist/, reload on change
	gulp.watch([config.assets_dest.path, config.theme_assets_dest.path, config.esp.path]).on('change', livereload.changed);
});

