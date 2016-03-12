var gulp = require('gulp'),
    babel = require('gulp-babel' );

var sourceFolder = './web-dev', // Folder containing development code
    buildFolder = './build',    // Folder for temporary files during build process
    distFolder = './dist';      // Folder containing distribution for upload to server

gulp.task('default', [
    'clean:build'
]);

