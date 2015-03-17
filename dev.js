var nodemon = require('nodemon');

nodemon({
    script: 'main.js',
    ext: 'js json',
    watch: [
        'app/**/*.*',
        'lib/**/*.*',
        'config.js',
        'config.json',
        'main.js',
        'package.json'
    ],
});

nodemon.on('start', function () {
    console.log('Server has started');
}).on('quit', function () {
    console.log('Server has quit');
}).on('restart', function (files) {
    console.log('Server restarted due to: ', files);
});
