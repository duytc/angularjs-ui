(function () {
    'use strict';

    angular
        .module('tagcade.videoManagement.videoPublisher')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state({
                name: 'videoManagement.videoPublisher',
                abstract: true,
                url: '/videoPublisherManagement'
            })

            .state({
                name: 'videoManagement.videoPublisher.list',
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'VideoPublisherList',
                        templateUrl: 'videoManagement/videoPublisherManagement/videoPublisherList.tpl.html'
                    }
                },
                resolve: {
                    videoPublishers: function(VideoPublisherManager, $stateParams ) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return VideoPublisherManager.one().get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Video Publishers'
                }
            })

            .state({
                name: 'videoManagement.videoPublisher.new',
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'VideoPublisherForm',
                        templateUrl: 'videoManagement/videoPublisherManagement/videoPublisherForm.tpl.html'
                    }
                },
                resolve: {
                    videoPublisher: function() {
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
                    label: 'New Video Publisher'
                }
            })

            .state({
                name: 'videoManagement.videoPublisher.edit',
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'VideoPublisherForm',
                        templateUrl: 'videoManagement/videoPublisherManagement/videoPublisherForm.tpl.html'
                    }
                },
                resolve: {
                    videoPublisher: function($stateParams, VideoPublisherManager) {
                        return VideoPublisherManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: function() {
                            return null;
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Video Publisher - {{ videoPublisher.name }}'
                }
            })
        ;
    }
})();