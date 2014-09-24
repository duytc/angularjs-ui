angular.module('tagcade.displayAds.tagManagement.site', [
    'ui.router'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('displayAds.tagManagement.sites', {
                abstract: true,
                url: '/sites'
            })
            .state('displayAds.tagManagement.sites.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'SiteListController',
                        templateUrl: 'displayAds/tagManagement/site/views/list.tpl.html'
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
            .state('displayAds.tagManagement.sites.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'SiteFormController',
                        templateUrl: 'displayAds/tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: function() {
                        return null;
                    }
                },
                customResolve: {
                      admin: {
                          publishers: function(AdminUserManager) {
                              return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                  return users.plain();
                              });
                          }
                      }
                },
                breadcrumb: {
                    title: 'New Site'
                }
            })
            .state('displayAds.tagManagement.sites.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'SiteFormController',
                        templateUrl: 'displayAds/tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: function($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'Edit Site - {{ site.name }} '
                }
            })
        ;
    })

;