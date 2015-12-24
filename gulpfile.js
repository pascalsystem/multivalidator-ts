var fs = require('fs');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var mocha = require('gulp-mocha');
var typedoc = require('gulp-typedoc');

var PATHS = {
    mainFileTs: 'main.ts',
	src: 'src',
	dest: 'release',
	tests: 'tests',
    docs: 'docs'
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

var generateMainFileTypeScript = function() {
	var files = fs.readdirSync(__dirname + '/' + PATHS.src);
    var content = '';
    var tsRef = [];
    var libraries = {};
    for (var i=0;i < files.length;i++) {
        if (files[i] === PATHS.mainFileTs) {
            continue;
        }
        var fileContent = fs.readFileSync(__dirname + '/' + PATHS.src + '/' + files[i]).toString('utf8');
        var resReq = fileContent.match(/import(\s)?([A-Za-z0-9\_]+)(\s)?\=(\s)?require\((\'|\")\.\/([^\'\"]+)(\'|\")\)\;/g);
        var resRef = fileContent.match(/\/\/\/(\s+)\<reference([^\>]+)\>/g);
        
        if (resRef) {
            for (var j=0;j < resRef.length;j++) {
                if (tsRef.indexOf(resRef[j]) === -1) {
                    tsRef.push(resRef[j]);
                }
                fileContent = fileContent.replace(resRef[j], '');
            }
        }
        
        if (resReq) {
            for (var j=0;j < resReq.length;j++) {
                fileContent = fileContent.replace(resReq[j], '');
                var resExp = resReq[j].match(/import(\s)?([A-Za-z0-9\_]+)(\s)?\=(\s)?require\((\'|\")\.\/([^\'\"]+)(\'|\")\)\;/);
                var localLibrary = resExp[2];
                var localModule = resExp[6].substr(0, 1).toUpperCase() + resExp[6].substr(1);
                libraries[localLibrary] = localModule;
            }
        }
        
        var moduleName = files[i].replace(/\.ts$/,'');
        moduleName = moduleName.substr(0, 1).toUpperCase() + moduleName.substr(1);
        
        content+= "\n";
        content+= "export module " + moduleName + " {" + "\n"
        var lines = fileContent.split("\n");
        for (var j=0;j < lines.length;j++) {
            if (lines[j].trim().length === 0) {
                continue;
            }
            content+= "    " + lines[j] + "\n";
        }
        content+= "}" + "\n";
    }
    
    for (var k in libraries) {
        content = content.split(k + '.').join(libraries[k] + '.');
    }
    
    var cleanContent = '';
    cleanContent+= tsRef.join("\n")
    cleanContent+= "\n";
    cleanContent+= content;
    
    fs.writeFileSync(PATHS.src + '/' + PATHS.mainFileTs, cleanContent);
};

gulp.task('typescript', function() {
    generateMainFileTypeScript();
	return gulp.src(PATHS.src + '/' + PATHS.mainFileTs).pipe(ts({
		typescript: require('typescript'),
		target: 'ES5',
		module: 'commonjs'
	})).js.pipe(gulp.dest(PATHS.dest));
});

gulp.task('typedoc', ['typescript'], function() {
    return gulp.src(PATHS.src + '/' + PATHS.mainFileTs).pipe(typedoc({
		module: 'commonjs',
		target: 'es5',
		out: PATHS.docs,
		theme: 'default',
		name: 'MultiValidator TypeScript PascalSystem'
	}));
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

gulp.task('build', ['typescript'], function(){
    
});