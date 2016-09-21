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
                url: '/adTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.adTag.list', {
                url: '/list?page&sortField&orderBy&search',
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
                    adTags: /* @ngInject */ function(VideoAdTagManager) {
                        return VideoAdTagManager.getList().then(function (adTags) {
                            return adTags.plain();
                        });
                    },
                    videoPublisher: function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Waterfall Tags'
                }
            })
            .state('videoManagement.adTag.listForVideoPublisher', {
                url: '/videoPublisher/{videoPublisherId:[0-9]+}/list?page&sortField&orderBy&search',
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
                        return VideoPublisherManager.one($stateParams.videoPublisherId).one('videowaterfalltags').getList().then(function (adTags) {
                            return adTags.plain();
                        });
                    },
                    videoPublisher: function(VideoPublisherManager, $stateParams) {
                        return VideoPublisherManager.one($stateParams.videoPublisherId).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Waterfall Tags For Video Publisher - {{ videoPublisher.name }}'
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
                    label: 'New Waterfall Tag'
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
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Waterfall Tag - {{ adTag.name }}'
                }
            })
        ;
    }
})();