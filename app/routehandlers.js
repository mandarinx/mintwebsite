var util            = require('util');
var logger          = require('logfmt');
var Promise         = require('promise');

var projects        = require('./projects');
var common          = require('./common');

var web;

module.exports = {
    init: function(webserver) {
        web = webserver;
        common.init(webserver);
        projects.init(webserver);

        web.events.on('construction', function(req, res, next) {
            under_construction(req, res, next);
        });

        web.events.on('home', function(req, res, next) {
            home(req, res, next);
        });

        web.events.on('about', function(req, res, next) {
            about(req, res, next);
        });

        web.events.on('contact', function(req, res, next) {
            contact(req, res, next);
        });

        web.events.on('works', function(req, res, next) {
            works(req, res, next);
        });

        web.events.on('work', function(req, res, next) {
            work(req, res, next);
        });
    }
};

function under_construction(req, res, next) {
    common.get(res)
    .then(function(results) {
        web.templates.render(res, 'construction', 'construction');

    }, function() {
        res.send('Under construction error');
    });
}

function home(req, res, next) {
    res.content.head = {};

    Promise.all([
        projects.get(res, {
            limit: 12,
            sort: 'published desc'}),
        common.get(res)
    ])
    .then(function (results) {

        var projects = results[0];
        if (projects.length > 0) {
            res.content.head.image = projects[0].image;
        }
        web.templates.render(res, 'main', 'home');

        console.log(util.inspect(process.memoryUsage()));

    }, function() {
        res.send('Home error');
    });
}

function about(req, res, next) {
    common.get(res)
    .then(function (common) {
        web.templates.render(res, 'main', 'about');
        console.log(util.inspect(process.memoryUsage()));

    }, function() {
        res.send('About error');
    });
}

function contact(req, res, next) {
    common.get(res)
    .then(function (common) {
        web.templates.render(res, 'main', 'contact');
        console.log(util.inspect(process.memoryUsage()));
    }, function() {
        res.send('Contact error');
    });
}

function work(req, res, next) {
    Promise.all([
        projects.get(res, {
            sort:   'published desc',
            id:     req.params.id
        }),
        common.get(res)
    ])
    .then(function (results) {

        if (res.content.projects.length === 0) {
            // TODO: get path from config.routes
            return res.redirect(301, '/works');
        }

        res.content.project = res.content.projects[0];

        if (res.content.project.slug != req.params.slug &&
            res.content.project.slugs.indexOf(req.params.slug) >= 0) {
            return res.redirect(301, projects.link(res.content.project));
        }

        web.templates.render(res, 'main', 'project');
        console.log(util.inspect(process.memoryUsage()));

    }, function() {
        // TODO: get path from config.routes
        return res.redirect(301, '/works');
    });

}

function works(req, res, next) {
    Promise.all([
        projects.get(res, {sort: 'published desc'}),
        common.get(res)
    ])
    .then(function (results) {
        web.templates.render(res, 'main', 'projects');
        console.log(util.inspect(process.memoryUsage()));
    }, function() {
        res.send('Projects error');
    });

}
