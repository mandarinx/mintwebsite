var Promise         = require('promise');

var web;

module.exports.init = function(webserver) {
    web = webserver;
}

module.exports.get = function(res, options) {
    res.content = res.content || {};
    res.content.projects = [];

    options = options || {};
    if (!options.id) {
        options.type = 'project';
    }
    options.limit = options.limit || undefined;
    options.sort = options.sort ?
                   '[my.project.'+options.sort+']' :
                   undefined;

    return new Promise(function (resolve, reject) {

        web.query(res.locals.ctx, options)
        .then(function(project_list) {

            getProjects(project_list.results, res.content.projects);
            resolve(res.content.projects);

        }, function(reason) {
            reject(reason);
        });

    });
}

function getProjects(project_list, content) {
    project_list.forEach(function(project, i) {

        content.push({
            i:              i,
            id:             project.id,
            link:           web.linkresolver.document('work', project),
            image:          web.utils.getImage(project.get('project.image')),
            name:           project.getText('project.name'),
            description:    project.getText('project.description'),
            og_description: project.getStructuredText('project.body').getFirstParagraph().text,
            body:           project.getStructuredText('project.body').asHtml(),
            slug:           project.slug,
            slugs:          project.slugs,

            gallery:        web.utils.iterateGroup({
                document:   project,
                path:       'project.gallery'
            }, function(doc, i) {
                return web.utils.getImage(doc.getImage('image'));
            })
        });
    });
}
