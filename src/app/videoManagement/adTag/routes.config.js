(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoManagement.adTag', {
                abstract: true,
                url: '/waterfalls',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.adTag.list', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'VideoAdTagList',
                        templateUrl: 'videoManagement/adTag/adTagList.tpl.html'
                    }
                },
                resolve: {
                    adTags: /* @ngInject */ function(VideoAdTagManager, $stateParams ) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return VideoAdTagManager.one().get($stateParams);
                    },
                    videoPublisher: function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Waterfalls'
                }
            })
            .state('videoManagement.adTag.listForVideoPublisher', {
                url: '/videoPublisher/{videoPublisherId:[0-9]+}/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'VideoAdTagList',
                        templateUrl: 'videoManagement/adTag/adTagList.tpl.html'
                    }
                },
                resolve: {
                    adTags: /* @ngInject */ function(VideoPublisherManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'name' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;

                        return VideoPublisherManager.one($stateParams.videoPublisherId).one('videowaterfalltags').get($stateParams);
                    },
                    videoPublisher: function(VideoPublisherManager, $stateParams) {
                        return VideoPublisherManager.one($stateParams.videoPublisherId).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Waterfalls For Video Publisher - {{ videoPublisher.name }}'
                }
            })
            .state('videoManagement.adTag.new', {
                url: '/new?videoPublisherId',
                views: {
                    'content@app': {
                        controller: 'VideoAdTagForm',
                        templateUrl: 'videoManagement/adTag/adTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },
                    videoPublishers: /* @ngInject */ function(VideoPublisherManager) {
                        return VideoPublisherManager.getList();
                    },
                    optimizeIntegrations: function (AutoOptimizeIntegrationManager) {
                        return AutoOptimizeIntegrationManager.one().get()
                            .then(function (autoOptimizeIntegrations) {
                                return autoOptimizeIntegrations.plain();
                            });
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
                    label: 'New Waterfall'
                }
            })
            .state('videoManagement.adTag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'VideoAdTagForm',
                        templateUrl: 'videoManagement/adTag/adTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: /* @ngInject */ function($stateParams, VideoAdTagManager) {
                        return VideoAdTagManager.one($stateParams.id).get();
                    },
                    videoPublishers: /* @ngInject */ function(VideoPublisherManager) {
                        return VideoPublisherManager.getList();
                    },
                    publishers: function() {
                        return null;
                    },
                    optimizeIntegrations: function (AutoOptimizeIntegrationManager) {
                        return AutoOptimizeIntegrationManager.one().get()
                            .then(function (autoOptimizeIntegrations) {
                                return autoOptimizeIntegrations.plain();
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Waterfall - {{ adTag.name }}'
                }
            })
        ;
    }
})();