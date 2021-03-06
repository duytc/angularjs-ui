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
                url: '/list?page&sortField&orderBy&searchKey',
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
                    sites: /* @ngInject */ function(SiteManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'name' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;
                        return SiteManager.one().get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Supply'
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
                    },
                    channels: /* @ngInject */ function(ChannelManager) {
                        return ChannelManager.getList();
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
                    label: 'New Supply'
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
                    site: /* @ngInject */ function($stateParams, SiteCache) {
                        return SiteCache.getSiteById($stateParams.id);
                    },
                    channels: function() {
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
                    label: 'Edit Supply - {{ site.name }}'
                }
            })

            .state('tagManagement.sites.channelList', {
                url: '/site/{id:[0-9]+}/channel?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'SiteChannelList',
                        templateUrl: 'tagManagement/site/siteChannelList.tpl.html'
                    }
                },
                resolve: {
                    site: /* @ngInject */ function(SiteCache, $stateParams) {
                        return SiteCache.getSiteById($stateParams.id);
                    },
                    channels: /* @ngInject */ function(SiteManager, $stateParams) {
                        return SiteManager.one($stateParams.id).getList('channels').then(function (channels) {
                            return channels.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Supply Group - {{ site.name }}'
                }
            })
        ;
    }
})();