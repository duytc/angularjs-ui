(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoManagement.demandAdTag', {
                abstract: true,
                url: '/demandAdTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.demandAdTag.list', {
                url: '/list',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AllDemandAdTagList',
                        templateUrl: 'videoManagement/demandAdTag/allDemandAdTagList.tpl.html'
                    }
                },
                resolve: {
                    demandAdTags: /* @ngInject */ function(VideoDemandAdTagManager) {
                        return VideoDemandAdTagManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Ad Tags'
                }
            })
            .state('videoManagement.demandAdTag.listByVideoTag', {
                url: '/videoWaterfallTag/{videoTagId:[0-9]+}/list',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'VideoDemandAdTagList',
                        templateUrl: 'videoManagement/demandAdTag/demandAdTagByVideoTagList.tpl.html'
                    }
                },
                resolve: {
                    videoWaterfallTagItems: /* @ngInject */ function($stateParams, $filter, VideoAdTagItemManager) {
                        return VideoAdTagItemManager.one('adtag').one($stateParams.videoTagId).get()
                            .then(function(videoAdTagItems) {
                                return $filter('orderBy')(videoAdTagItems, 'position')
                            });
                    },
                    videoWaterfallTag: /* @ngInject */ function($stateParams, VideoAdTagManager) {
                        return VideoAdTagManager.one($stateParams.videoTagId).get()
                            .then(function(videoAdTag) {
                                return videoAdTag
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Ad Tags'
                }
            })
            .state('videoManagement.demandAdTag.listByDemandPartner', {
                url: '/videoDemandPartner/{id:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'DemandAdTagList',
                        templateUrl: 'videoManagement/demandAdTag/demandAdTagList.tpl.html'
                    }
                },
                resolve: {
                    demandAdTags: /* @ngInject */ function($stateParams, VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.one($stateParams.id).one('videodemandadtags').getList();
                    },
                    demandPartner: function($stateParams, VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Ad Tags'
                }
            })
            .state('videoManagement.demandAdTag.listByLibrary', {
                url: '/demandAdTagLibrary/{id:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null,
                    listByLibrary: true
                },
                views: {
                    'content@app': {
                        controller: 'DemandAdTagList',
                        templateUrl: 'videoManagement/demandAdTag/demandAdTagList.tpl.html'
                    }
                },
                resolve: {
                    demandAdTags: /* @ngInject */ function($stateParams, LibraryDemandAdTagManager) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'name' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;

                        return LibraryDemandAdTagManager.one($stateParams.id).one('videodemandadtags').get($stateParams);
                    },
                    demandPartner: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Linked Demand Ad Tags'
                }
            })
            .state('videoManagement.demandAdTag.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'DemandAdTagForm',
                        templateUrl: 'videoManagement/demandAdTag/demandAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    demandAdTag: /* @ngInject */ function() {
                        return null;
                    },
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.getList().then(function (demandPartners) {
                            return demandPartners.plain();
                        });
                    },
                    blackList: function(BlackListManager) {
                        return BlackListManager.getList()
                    },
                    whiteList: function(WhiteListManager) {
                        return WhiteListManager.getList()
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
                    label: 'Edit Demand Ad Tag'
                }
            })
            .state('videoManagement.demandAdTag.edit', {
                url: '/edit/{id:[0-9]+}?libraryDemandAdTagId?allDemand',
                views: {
                    'content@app': {
                        controller: 'DemandAdTagForm',
                        templateUrl: 'videoManagement/demandAdTag/demandAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    demandAdTag: /* @ngInject */ function($stateParams, VideoDemandAdTagManager) {
                        return VideoDemandAdTagManager.one($stateParams.id).get();
                    },
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.getList().then(function (demandPartners) {
                            return demandPartners.plain();
                        });
                    },
                    publishers: function() {
                        return null;
                    },
                    blackList: function(BlackListManager) {
                        return BlackListManager.getList()
                    },
                    whiteList: function(WhiteListManager) {
                        return WhiteListManager.getList()
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Demand Ad Tag'
                }
            })
        ;
    }
})();