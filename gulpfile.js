var gulp = require('gulp');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var mocha = require('gulp-mocha');

var PATHS = {
	src: 'src/**/*.ts',
	dest: 'release',
	tests: 'tests'
};

var runTests = function(sourcePaths) {
    return gulp.src(sourcePaths)
        .pipe(mocha())
        .once('error', function(err) {
            console.error(err);
        })
        .once('end', function() {
        });
};

gulp.task('typescript', function() {
	return gulp.src(PATHS.src).pipe(ts({
		typescript: require('typescript'),
		target: 'ES5',
		module: 'commonjs'
	})).js.pipe(gulp.dest(PATHS.dest));
});

gulp.task('test-validator', ['typescript'], function() {
    runTests(PATHS.tests + '/01_validator.js');
});

gulp.task('test-property', ['typescript'], function() {
    runTests(PATHS.tests + '/02_property.js');
});

gulp.task('test-model', ['typescript'], function() {
    runTests(PATHS.tests + '/03_model.js');
});

gulp.task('test', ['typescript'], function() {
    runTests(PATHS.tests + '/*.js');
});

gulp.task('build', ['typescript'], function() {
	
});
