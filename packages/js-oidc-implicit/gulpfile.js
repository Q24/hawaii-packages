var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglifyjs'),
  rename = require('gulp-rename'),
  deleteLines = require('gulp-delete-lines');

// configure the jshint task
gulp.task('buildService', function () {
  return gulp.src('src/oidc-service.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(deleteLines({
      'filters': [
        /self._log\(.+?(?=\);)../ig
      ]
    }))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('buildCleanHashFragment', function () {
  return gulp.src('src/clean-hash-fragment.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch(buildFiles, ['build']);
});

gulp.task('build', ['buildService', 'buildCleanHashFragment']);
gulp.task('default', ['build', 'watch']);

