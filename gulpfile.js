"use strict";

var gulp = require('gulp'),
    gutil = require('gulp-util' ),
    babel = require('gulp-babel' ),
    sass = require('gulp-sass'),
    del = require('del'),
    webpack = require('webpack');

// TODO: Load appropriate config for development/production
var webpackConfig = require('./webpack.config.js');

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
 * Builds the webpack bundle for the application.
 */
gulp.task('webpack', function(callback) {
    webpack(webpackConfig, function(err, stats) {
        if ( err )
            throw new gutil.PluginError('webpack', err);
        callback();
    });
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
