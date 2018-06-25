# Installation to work on package
This bower package is pulled in at a fixed version by the barebones app so for most sites sits at that version, to develop a new feature for the package this repo should be cloned, then the changes should be committed and tagged, then updated in the site/barebones' bower.json file.

# Installation
Install via bower:

    bower install git@gitlab.lab:bower-components/admin.git#<TAG/BRANCH> --save-dev

Add an admin gulp task file in the `gulp-tasks` folder. 

e.g.

```javascript
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
	autoprefixer = require('gulp-autoprefixer');

/**
*
* Fetch config from bower package
*
**/

var config = require('../bower_components/admin/gulp-config.json');


/**
*
* Tasks
*
**/

/**
*
* Sass
*
**/
gulp.task('admin-sass', function(){
	gulp.src(config.sass.files)
		.pipe(sass({ onError: function(err) { console.log(err) }}))
		.pipe(autoprefixer({ browsers: ['last 2 versions'] }))
		.pipe(minifyCSS({ keepSpecialComments: 0 }))
		.pipe(concat('style.css'))
		.pipe(gulp.dest(config.sass.minFolder));
});

/**
*
* Scripts
*
**/
gulp.task('admin-scripts', function(){
	gulp.src(config.scripts.files)
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.scripts.minFolder));
});

/**
 *
 * Copies
 *
 **/
gulp.task('admin-copies', function(){
	for (var source in config.copies) {
		var destination = config.copies[source];
		gulp.src(source)
			.pipe(gulp.dest(destination));
	}
});

gulp.task('admin', ['admin-sass', 'admin-scripts', 'admin-copies']);
```

The app will likely alread have all the required npm packages but in case it 
doesn't then this is the list:

* gulp
* gulp-autoprefixer
* gulp-combine-media-queries
* gulp-concat
* gulp-minify-css
* gulp-sass
* gulp-sourcemaps
* gulp-uglify
* require-dir


# Usage

`gulp admin`

