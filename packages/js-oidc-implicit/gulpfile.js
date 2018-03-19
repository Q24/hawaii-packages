var buildFiles = 'src/oidc-service.js',
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglifyjs'),
    rename = require('gulp-rename'),
    deleteLines = require('gulp-delete-lines');


// configure the jshint task
gulp.task('build', function () {
  return gulp.src(buildFiles)
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

gulp.task('watch', function () {
  gulp.watch(buildFiles, ['build']);
});


gulp.task('default', ['build', 'watch']);

