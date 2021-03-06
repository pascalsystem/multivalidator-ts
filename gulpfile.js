var fs = require('fs');
var merge = require('merge2');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var mocha = require('gulp-mocha');
var typedoc = require('gulp-typedoc');
var stripComments = require('strip-comments');

var PATHS = {
    mainFileTs: 'main.ts',
	src: 'src',
	dest: 'release',
    typings: 'multivalidator-ts.d.ts',
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

var compileTypeScript = function(generateWithDTS) {
    generateMainFileTypeScript();
	var tsSource = gulp.src(PATHS.src + '/' + PATHS.mainFileTs).pipe(ts({
		typescript: require('typescript'),
		target: 'ES5',
		module: 'commonjs',
        declarationFiles: true
	}));
    
    if (generateWithDTS) {
        return merge([
            tsSource.js.pipe(gulp.dest(PATHS.dest)),
            tsSource.dts.pipe(gulp.dest(__dirname))
        ]);
    }
    return tsSource.js.pipe(gulp.dest(PATHS.dest));
};

var modifyTypeScriptDef = function(filePath){
    var lines = fs.readFileSync(filePath).toString('utf8').split("\n");
    var newLines = [
        'declare module "multivalidator-ts" {',
        '    export = MultivalidatorTs;',
        '}',
        ''
    ];
    newLines.push('declare module MultivalidatorTs {');
    for (var i=0;i < lines.length;i++) {
        if (lines[i].trim().indexOf('///') === 0) {
            continue;
        }
        lines[i] = lines[i].replace(/([\s]+)?export([\s]+)declare([\s]+)module([\s]+)/, function(result, res1, res2, res3, res4){
            return ((typeof res1 === 'string') ? res1 : '') + 'export module ';
        });
        newLines.push('    ' + lines[i]);
    }
    newLines.push('}')
    fs.writeFileSync(filePath, newLines.join("\n"));
};

gulp.task('typescript-js-prepare', function(){
    return compileTypeScript();
});

gulp.task('typescript-dts-prepare', function(){
    return compileTypeScript(true);
});

gulp.task('typescript-min', ['typescript-js-prepare'], function(){
    
});

gulp.task('typescript-full', ['typescript-dts-prepare'], function(){
    fs.renameSync(PATHS.mainFileTs.replace(/\.ts$/, '.d.ts'), PATHS.typings);
    modifyTypeScriptDef(PATHS.typings);
});

gulp.task('typedoc-release', ['typescript-full'], function() {
    return gulp.src(PATHS.src + '/' + PATHS.mainFileTs).pipe(typedoc({
		module: 'commonjs',
		target: 'es5',
		out: PATHS.docs,
		theme: 'default',
		name: 'MultiValidator TypeScript PascalSystem'
	}));
});

gulp.task('test-validator', ['typescript-min'], function() {
    runTests(PATHS.tests + '/01_validator.js');
});

gulp.task('test-property', ['typescript-min'], function() {
    runTests(PATHS.tests + '/02_property.js');
});

gulp.task('test-model', ['typescript-min'], function() {
    runTests(PATHS.tests + '/03_model.js');
});

gulp.task('test', ['typescript-min'], function() {
    runTests(PATHS.tests + '/*.js');
});

gulp.task('build', ['typedoc-release'], function(){
    var filePath = PATHS.dest + '/main.js';
    var cleanCode = stripComments(fs.readFileSync(filePath).toString('utf8'));
    fs.writeFileSync(filePath, cleanCode);
});