# Installation
Install via bower:

    bower install git@gitlab.lab:bower-components/admin.git#master --save-dev

Add an `admin.js` gulp task file:

	/**
	*
	* Plugins
	*
	**/

	var gulp = require('gulp'),
		concat = require('gulp-concat'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		uglify = require('gulp-uglify'),
		minifyCSS = require('gulp-minify-css'),
		combineMediaQueries = require('gulp-combine-media-queries'),
		autoprefixer = require('gulp-autoprefixer');

	var config = require('../bower_components/admin/gulp-config.json');


	/**
	*
	* Tasks
	*
	**/

	gulp.task('admin', function(){

		/**
		*
		* Sass
		*
		**/

		gulp.src(config.sass.files)
			.pipe(sass({ onError: function(err) { console.log(err) }}))
			.pipe(autoprefixer({ browsers: ['last 2 versions'] }))
			.pipe(combineMediaQueries())
			.pipe(minifyCSS({ keepSpecialComments: 0 }))
			.pipe(concat('style.css'))
			.pipe(gulp.dest(config.sass.minFolder));

		/**
		*
		* Scripts
		*
		**/

		gulp.src(config.scripts.files)
			.pipe(concat('app.js'))
			.pipe(uglify())
			.pipe(gulp.dest(config.scripts.minFolder));

		/**
		 *
		 * Copies
		 *
		 **/

		for (var source in config.copies) {
			var destination = config.copies[source];
			gulp.src(source)
				.pipe(gulp.dest(destination));
		}

	});