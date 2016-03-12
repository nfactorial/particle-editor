"use strict";

var gulp = require('gulp'),
    babel = require('gulp-babel' ),
    sass = require('gulp-sass'),
    del = require('del');

var sourceFolder = './web-dev', // Folder containing development code
    buildFolder = './build',    // Folder for temporary files during build process
    distFolder = './dist';      // Folder containing distribution for upload to server

gulp.task('default', [
    'clean:build'
]);


/**
 * Deletes all files inside the build folder.
 */
gulp.task('clean:build', function() {
    return del.sync([buildFolder + '/**/*'])
});


/**
 * Compiles all .sass files into raw css.
 */
gulp.task('build:sass', function() {
    return gulp.src(sourceFolder + '/**/!(_)*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(distFolder));
});


/**
 * Compiles all jsx files into ES5 source files.
 */
gulp.task('build:js', function() {
    return gulp.src(sourceFolder + '/**/*!(-compiled).jsx')
        .pipe(babel())
        .pipe(gulp.dest(buildFolder));
});
