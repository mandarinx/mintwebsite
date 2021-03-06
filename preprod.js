var fs              = require('fs');
var path            = require('path');
var wrench          = require('wrench');
var morecss         = require('more-css');
var inlineSource    = require('inline-source');
var Imagemin        = require('imagemin');
var Minimize        = require('minimize');
var UglifyJS        = require("uglify-js");

var svgo = Imagemin.svgo([
    {removeViewBox: true},
    {removeEmptyAttrs: true},
    {removeEmptyContainers: true},
    {removeEmptyText: true},
    {removeHiddenElems: true},
    {removeMetadata: true},
    {removeRasterImages: true},
    {removeUselessStrokeAndFill: true},
    {cleanupAttrs: true},
    {removeComments: true},
    {removeDesc: true},
    {removeDoctype: true}
]);

var optipng = Imagemin.optipng({ optimizationLevel: 3 });

var dir = {
    prod:           __dirname + '/production/',
    pub:            __dirname + '/public/',
    prodpub:        __dirname + '/production/public/',
    appview:        __dirname + '/app/views/',
    appcss:         __dirname + '/app/views/css/',
    prodappview:    __dirname + '/production/app/views/',
    prodappcss:     __dirname + '/production/app/views/css/'
};

// -----------------------------------------------------------------------------
cleanCopyDir(dir.pub,       dir.prodpub);
cleanCopyDir(dir.appview,   dir.prodappview);

minifyCss(dir.prod);
uglify(dir.prodpub + 'js/');
inline(dir.prodappview + 'layouts/', '.hbs');
imagemin(dir.prodpub + 'images/', '.svg', svgo);
imagemin(dir.prodpub + 'images/', '.png', optipng);
htmlmin(dir.prodappview, '.hbs');

// -----------------------------------------------------------------------------

function uglify(dir) {
    console.log('Uglify JS');

    var files = listFiles(dir, '.js')
        .map(function(file) {
            console.log('    '+dir+file);
            return dir + file;
        });

    files.forEach(function(file) {
        var content = UglifyJS.minify(file);
        fs.writeFileSync(file, content.code);
    });

    console.log('');
}

function htmlmin(dir, ext) {
    console.log('HTMLMin');

    minimize = new Minimize({
        empty: true,        // KEEP empty attributes
        cdata: true,        // KEEP CDATA from scripts
        comments: false,    // KEEP comments
        ssi: false,         // KEEP Server Side Includes
        conditionals: true, // KEEP conditional internet explorer comments
        spare: true,        // KEEP redundant attributes
        quotes: true,       // KEEP arbitrary quotes
        loose: false        // KEEP one whitespace
    });

    var files = listFiles(dir, ext)
        .map(function(file) {
            console.log('    '+dir+file);
            return dir + file;
        });

    files.forEach(function(file) {
        var content = fs.readFileSync(file, 'utf8');
        minimize.parse(content, function (error, data) {
            fs.writeFileSync(file, data);
        });
    });

    console.log('');
}

function imagemin(dir, ext, minifier) {
    console.log('Imagemin '+dir+'*'+ext);

    var imagemin = new Imagemin()
        .src(dir + '*' + ext)
        .dest(dir)
        .use(minifier);

    imagemin.run(function(err, files) {
        if (err) {
            throw err;
        }
    });

    console.log('');
}

function inline(dir, ext) {
    console.log('Inline');

    var files = listFiles(dir, ext)
        .map(function(file) {
            console.log('    '+dir+file);
            return dir + file;
        });

    files.forEach(function(file) {
        var html = inlineSource(file, {
            compress: false,
            swallowErrors: false,
            rootpath: path.resolve('production/')
        });
        fs.writeFileSync(file, html);
    });

    console.log('');
}

function minifyCss(dir) {
    console.log('Minify CSS');
    var css_files = listFiles(dir, '.css')
        .map(function(file) {
            console.log('    '+dir+file);
            return dir + file;
        });

    css_files.forEach(function(file) {
        var source = fs.readFileSync(file, 'utf8');
        var minified = morecss.compress(source, true);
        fs.writeFileSync(file, minified);
    });
    console.log('');
}

function listFiles(dir, ext) {
    return wrench.readdirSyncRecursive(dir).filter(function(file) {
        return path.extname(file) === ext;
    });
}

function cleanCopyDir(from, to) {
    wrench.rmdirSyncRecursive(to, true);
    wrench.mkdirSyncRecursive(to, 0777);

    wrench.copyDirSyncRecursive(from, to, {
        forceDelete: true,
        excludeHiddenUnix: false,
        preserveFiles: false,
        preserveTimestamps: false,
        inflateSymlinks: false
    });
}
