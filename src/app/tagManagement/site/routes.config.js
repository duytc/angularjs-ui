(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.sites', {
                abstract: true,
                url: '/sites',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.sites.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'SiteList',
                        templateUrl: 'tagManagement/site/siteList.tpl.html'
                    }
                },
                resolve: {
                    sites: /* @ngInject */ function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Sites'
                }
            })
            .state('tagManagement.sites.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'SiteForm',
                        templateUrl: 'tagManagement/site/siteForm.tpl.html'
                    }
                },
                resolve: {
                    site: function() {
                        return null;
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Site'
                }
            })
            .state('tagManagement.sites.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'SiteForm',
                        templateUrl: 'tagManagement/site/siteForm.tpl.html'
                    }
                },
                resolve: {
                    site: /* @ngInject */ function($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Site - {{ site.name }}'
                }
            })
        ;
    }
})();