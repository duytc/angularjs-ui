(function() {
    'use strict';

    angular.module('tagcade.videoManagement.IVTPixel')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoManagement.IVTPixel', {
                abstract: true,
                url: '/IVTPixels',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.IVTPixel.list', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'IVTPixelList',
                        templateUrl: 'videoManagement/IVTPixel/IVTPixelList.tpl.html'
                    }
                },
                resolve: {
                    IVTPixels: /* @ngInject */ function(VideoIVTPixelManager, $stateParams ) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'detail' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;
                        return VideoIVTPixelManager.one().get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'IVT Pixels'
                }
            })
            .state('videoManagement.IVTPixel.new', {
                url: '/new?videoPublisherId',
                views: {
                    'content@app': {
                        controller: 'VideoIVTPixelForm',
                        templateUrl: 'videoManagement/IVTPixel/IVTPixelForm.tpl.html'
                    }
                },
                resolve: {
                    IVTPixel: function() {
                        return null;
                    },
                    waterfalls: function (VideoAdTagManager) {
                        return VideoAdTagManager.getList()
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
                    label: 'New IVT Pixel'
                }
            })
            .state('videoManagement.IVTPixel.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'VideoIVTPixelForm',
                        templateUrl: 'videoManagement/IVTPixel/IVTPixelForm.tpl.html'
                    }
                },
                resolve: {
                    IVTPixel: /* @ngInject */ function($stateParams, VideoIVTPixelManager) {
                        return VideoIVTPixelManager.one($stateParams.id).get();
                    },
                    waterfalls: function (VideoAdTagManager) {
                        return VideoAdTagManager.getList()
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit IVT Pixel - {{ IVTPixel.name }}'
                }
            })
        ;
    }
})();