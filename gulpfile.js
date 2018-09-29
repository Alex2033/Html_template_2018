var syntax        = 'sass';

var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync'),
		pug           = require('gulp-pug'),
		htmlmin       = require('gulp-htmlmin'),
		imagemin      = require('gulp-imagemin'),
		gulpSequence  = require('gulp-sequence'),
		wait          = require('gulp-wait');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'dev'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('pug', function() {
	return gulp.src('dev/pug/pages/*.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('dev'))
});

gulp.task('styles', function() {
	return gulp.src('dev/sass/main.sass')
	.pipe(wait(1000))
	.pipe(sass({ 'include css': true }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('dev/css'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
	return gulp.src([
		'dev/libs/jquery/prod/jquery.min.js',
		'dev/libs/font-awesome/fontawesome-all.min.js',
		'dev/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('dev/js'))
	.pipe(browsersync.reload({ stream: true }))
});

gulp.task('transfer', function(){
    return gulp.src([
		"dev/**",
		"!dev/pug",
		"!dev/sass",
		"!dev/js/common.js",
	])
        .pipe(gulp.dest("prod"))
});

gulp.task('html-minify', function() {
	return gulp.src('dev/*.html')
	  .pipe(htmlmin({collapseWhitespace: true}))
	  .pipe(gulp.dest('prod'));
  });

gulp.task('imgmin', () =>
  gulp.src('dev/img/**/*')
	  .pipe(imagemin())
	  .pipe(gulp.dest('prod/img'))
);

gulp.task('build', gulpSequence('transfer', 'html-minify', 'imgmin'));

gulp.task('rsync', function() {
	return gulp.src('dev/**')
	.pipe(rsync({
		root: 'dev/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', ['pug', 'styles', 'js', 'browser-sync'], function() {
	gulp.watch('dev/'+syntax+'/**/*.'+syntax+'', ['styles']);
	gulp.watch(['libs/**/*.js', 'dev/js/common.js'], ['js']);
	gulp.watch('dev/pug/*/*.pug', ['pug']);
	gulp.watch('dev/*.html', browsersync.reload);
});

gulp.task('default', ['watch']);
