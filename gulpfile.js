const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');


gulp.task('styles', function (done) {
  gulp.src('./assets/scss/app.scss')
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(autoprefixer())
    .pipe(cleanCss())
    .pipe(concat('custom.min.css'))
    .pipe(gulp.dest('public/styles/'));

  done();
});

gulp.task('swiper', function (done) {
  gulp.src('./node_modules/swiper/js/swiper.min.js')
    .pipe(gulp.dest('public/scripts/'));

  gulp.src('./node_modules/swiper/js/swiper.min.js.map')
    .pipe(gulp.dest('public/scripts/'));

  gulp.src('./node_modules/swiper/css/swiper.min.css')
    .pipe(gulp.dest('public/styles/'));

  done();
});

gulp.task('scripts', function (done) {
  gulp.src('./assets/js/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('custom.min.js'))
    .pipe(gulp.dest('public/scripts/'));

  done();
});

gulp.task('watch', function (done) {
  gulp.watch('./assets/**/*', gulp.series('styles', 'scripts'));

  done();
});

gulp.task('default', gulp.parallel('swiper', 'styles', 'scripts', 'watch'));