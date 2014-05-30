var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('lint', function(){
    return gulp.src("fastsync.js")
               .pipe(jshint())
               .pipe(jshint.reporter(jshintStylish))
               .pipe(jshint.reporter('fail'));
});

gulp.task('build', function(){
    return gulp.src("fastsync.js")
               .pipe(uglify())
               .pipe(rename('fastsync.min.js'))
               .pipe(gulp.dest('.'));
});
