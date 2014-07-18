var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var cssmin = require('gulp-cssmin');

var path = {
  scripts: ['src/*.js', 'src/**/*.js'],
  style: ['src/*.css', 'src/**/*.css']
};

gulp.task('concat', function () {
  gulp.src(path.scripts)
      .pipe(concat('drive-web-svg.js'))
      .pipe(gulp.dest('./bower-drive-web-svg'));
});

gulp.task('jshint', function () {
  gulp.src(path.scripts)
      .pipe(jshint());
});

gulp.task('uglify', function () {
  gulp.src(path.scripts)
      .pipe(uglify())
      .pipe(concat('drive-web-svg.min.js'))
      .pipe(gulp.dest('./bower-drive-web-svg'));
});

gulp.task('minify-css', function () {
  gulp.src(path.style)
      .pipe(cssmin())
      .pipe(gulp.dest('./bower-drive-web-svg'))
});

gulp.task('default', ['concat', 'jshint', 'uglify', 'minify-css']);
gulp.task('watch', function () {
  gulp.watch(path.scripts, ['default']);
});
