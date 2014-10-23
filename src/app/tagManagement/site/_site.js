angular.module('tagcade.tagManagement.site', [
    'ui.router'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.sites', {
                abstract: true,
                url: '/sites'
            })
            .state('tagManagement.sites.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'SiteListController',
                        templateUrl: 'tagManagement/site/views/list.tpl.html'
                    }
                },
                resolve: {
                    sites: /* @ngInject */ function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Sites'
                }
            })
            .state('tagManagement.sites.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'SiteFormController',
                        templateUrl: 'tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: function() {
                        return null;
                    }
                },
                customResolve: {
                      admin: {
                          publishers: /* @ngInject */ function(AdminUserManager) {
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
            .state('tagManagement.sites.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'SiteFormController',
                        templateUrl: 'tagManagement/site/views/form.tpl.html'
                    }
                },
                resolve: {
                    site: /* @ngInject */ function($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(AdminUserManager) {
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