'use strict';

var gulp = require('gulp');
var bitcoreTasks = require('bitcore-build-dash');

bitcoreTasks('message');

gulp.task('default', ['lint', 'coverage']);
