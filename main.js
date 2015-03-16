var routehandlers   = require('./app/routehandlers');
var config          = require('./config.json');
// TODO: replace with require('prismic-website') after submitting to npm
var website         = require('./lib/index');

website.on('ready', function(webserver) {
    routehandlers.init(webserver);
});

website.init(config, {
    base: __dirname
});
