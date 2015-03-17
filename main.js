var routehandlers   = require('./app/routehandlers');
var config          = require('./config.json');
// var website         = require('./lib/index');
var website         = require('prismic-website');

website.on('ready', function(webserver) {
    routehandlers.init(webserver);
});

website.init(config, {
    base: __dirname
});
