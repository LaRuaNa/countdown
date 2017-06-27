const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('styles', () => {
  gulp.src('src/css/*.css')
    .pipe(autoprefixer({
      versions: ['last 2 browsers'],
    }))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('watch', () => {
  gulp.watch('src/style.css', ['styles']);
});

gulp.task('default', ['styles']);
