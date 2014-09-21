angular.module('tagcade.publisher.tagManagement.site', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tagManagement.sites', {
                abstract: true,
                url: '/sites'
            })
            .state('app.publisher.tagManagement.sites.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'PublisherSiteListController',
                        templateUrl: 'publisher/tagManagement/site/views/list.tpl.html'
                    }
                },
                resolve: {
                    sites: function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Sites'
                }
            })
            .state('app.publisher.tagManagement.sites.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'PublisherSiteFormController',
                        templateUrl: 'publisher/tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: function() {
                        return null;
                    }
                },
                breadcrumb: {
                    title: 'New Site'
                }
            })
            .state('app.publisher.tagManagement.sites.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'PublisherSiteFormController',
                        templateUrl: 'publisher/tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: function($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.id).get();
                    }
                },
                breadcrumb: {
                    title: 'Edit Site - {{ site.name }} '
                }
            })
        ;
    })

;