var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var path = {
scripts:['src/*.js','src/**/*.js']
};

gulp.task('concat', function () {
    gulp.src(path.scripts)
        .pipe(concat('goodjs-ui.js'))
        .pipe(gulp.dest('./bower-goodjs-ui'));
});

gulp.task('jshint', function () {
    gulp.src(path.scripts)
        .pipe(jshint());
});

gulp.task('uglify', function () {
    gulp.src(path.scripts)
        .pipe(uglify())
        .pipe(concat('goodjs-ui.min.js'))
        .pipe(gulp.dest('./bower-goodjs-ui'));
});

gulp.task('concat_local', function () {
  gulp.src(path.scripts)
      .pipe(concat('goodjs-ui.js'))
      .pipe(gulp.dest('../drive-web/app/bower_components/goodjs-ui/'));
});
gulp.task('uglify_local', function () {
  gulp.src(path.scripts)
      .pipe(uglify())
      .pipe(concat('goodjs-ui.min.js'))
      .pipe(gulp.dest('../drive-web/app/bower_components/goodjs-ui/'));
});


gulp.task('default', ['concat','jshint','uglify']);
gulp.task('local', ['concat_local','uglify_local']);
gulp.task('watch', function() {
  gulp.watch(path.scripts, ['default']);
});
