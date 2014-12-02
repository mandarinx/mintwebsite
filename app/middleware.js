var Prismic         = require('prismic.io').Prismic;
var Promise         = require('promise');
var config          = require('../config');
var common          = require('./modules/common');
var app             = require('./app');

var threeHours = 60 * 60 * 3 * 1000;

// Router middleware that adds a Prismic context to the res object
module.exports.prismic = function(req, res, next) {
    Prismic.Api(config.apiEndpoint, function(err, Api) {
        if (err) {
            return res.send(500, 'Error 500: ' + err.message);
        }

        var ref = req.query['ref'] || Api.master();
        var ctx = {
            api:        Api,
            ref:        ref,
            maybeRef:   ref == Api.master() ? undefined : ref,

            oauth: function() {
                var token = accessToken;
                return {
                    accessToken:            token,
                    hasPrivilegedAccess:    !!token
                }
            }
        };
        res.locals.ctx = ctx;
        next();

    }, config.accessToken);
};

module.exports.construction = function(req, res, next) {

    // Check query param
    if (req.query.bypass === 'true') {
        res.cookie('in_dev', true, {
            maxAge: threeHours,
            httpOnly: true
        });
        next();
        return;
    }

    // Bypass due to cookie
    if (req.cookies.in_dev === 'true') {
        next();
        return;
    }

    if (config.construction) {
        var content = {};

        common.get(res.locals.ctx, content)
        .then(function(results) {
            app.render(res, 'construction', 'construction', content);

        }, function() {
            res.send('Home error');
        });

        return;
    }

    // Failover
    next();
};
