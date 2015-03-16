var Promise         = require('promise');

var web;

module.exports.init = function(webserver) {
    web = webserver;
}

module.exports.get = function get(res) {
    res.content = res.content || {};
    res.content.common = {};

    return new Promise(function (resolve, reject) {
        web.bookmarks.get(res.locals.ctx)
        .then(function(bookmarks) {

            aboutPage(bookmarks.about, res.content.common);
            contactPage(bookmarks.contact, res.content.common);

            resolve(res.content.common);

        }, function() {
            reject('Could not get common');
        });
    });
}

function contactPage(contact, common) {
    if (!contact) {
        return;
    }

    common.contact = {
        email:      web.linkresolver.email(contact.getText('contact.email')),
        telephone:  contact.getText('contact.telephone'),
        address:    contact.getStructuredText('contact.address').asHtml(),
        location:   contact.getGeoPoint('contact.location')
    };
}

function aboutPage(about, common) {
    if (!about) {
        return;
    }

    common.about = {
        headline:       about.getText('about.headline'),
        companyname:    about.getText('about.companyname'),
        tagline_text:   about.getStructuredText('about.tagline').asText(),
        tagline:        about.getStructuredText('about.tagline').asHtml(),
        content:        about.getStructuredText('about.content').asHtml(),
        image:          web.utils.getImage(about.get('about.image'))
    };

    common.about.employees = web.utils.iterateGroup({
        document:   about,
        path:       'about.employees'
    }, function(employee, i) {

        return {
            image:      web.utils.getImage(employee.getImage('image')),
            fullname:   employee.getText('fullname'),
            about:      employee.getStructuredText('about').asHtml(),
            telephone:  employee.getText('telephone'),
            email:      web.linkresolver.email(employee.getText('email')),
            i:          i
        };

    });

    common.about.clients = web.utils.iterateGroup({
        document:   about,
        path:       'about.clients'
    }, function(client, i) {

        return {
            image:      web.utils.getImage(client.getImage('image')),
            fullname:   client.getText('fullname'),
            i:          i
        };

    });

    common.about.awards = web.utils.iterateGroup({
        document:   about,
        path:       'about.awards'
    }, function(award, i) {

        return {
            title:              award.getText('title'),
            nomination:         award.getText('nomination'),
            year:               award.getNumber('year'),
            link:               award.getText('link'),
            related_article:    web.linkresolver.document('work', award.getLink('related_article'))
        };

    });
}
