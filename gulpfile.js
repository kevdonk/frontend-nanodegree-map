var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var deploy = require('gulp-gh-pages');
var inlinesource = require('gulp-inline-source');
var imgmin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

gulp.task('html', ['css'], function() {
	return gulp.src('*.html')
	.pipe(inlinesource({
		compress: true
	}))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('dist'));
});

gulp.task('png', function() {
	return gulp.src('img/*.png')
	.pipe(imgmin({
		use: [pngcrush()]
	}))
	.pipe(gulp.dest('dist/img/'));
});

gulp.task('scripts', function() {
	return gulp.src('js/*.js')
	.pipe(uglify())
	.pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function() {
	return gulp.src('css/*.css')
	.pipe(cssmin())
	.pipe(gulp.dest('dist/css/'));
});

gulp.task('jshint', function() {
	return gulp.src('js/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('deploy', function() {
	return gulp.src("./dist/**/*")
	.pipe(deploy())
});

gulp.task('watch', function() {
	gulp.watch('js/*.js') ['scripts'];
	gulp.watch('css/*.css') ['css'];
	gulp.watch('*.html') ['html'];
});

gulp.task('build', ['jshint', 'png', 'scripts','css','html']);

gulp.task('default', ['build','watch']);