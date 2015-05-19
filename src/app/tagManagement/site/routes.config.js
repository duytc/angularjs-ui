(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagManagement.sites', {
                abstract: true,
                url: '/sites',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.sites.list', {
                url: '/list?isCurrentPage',
                views: {
                    'content@app': {
                        controller: 'SiteList',
                        templateUrl: 'tagManagement/site/siteList.tpl.html'
                    }
                },
                resolve: {
                    sites: /* @ngInject */ function(SiteManager, statusManagementService, $stateParams) {
                        if(!$stateParams.isCurrentPage) {
                            statusManagementService.setCurrentPageForSite(0);
                        }

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