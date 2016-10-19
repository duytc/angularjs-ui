(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoLibrary.demandAdTag', {
                abstract: true,
                url: '/demandAdTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoLibrary.demandAdTag.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'LibraryDemandAdTagList',
                        templateUrl: 'videoLibrary/demandAdTag/libraryDemandAdTagList.tpl.html'
                    }
                },
                resolve: {
                    demandAdTags: /* @ngInject */ function(LibraryDemandAdTagManager) {
                        return LibraryDemandAdTagManager.getList()
                    },
                    demandPartner: function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Ad Tags'
                }
            })
            .state('videoLibrary.demandAdTag.listByDemandPartner', {
                url: '/videoDemandPartner/{id:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'LibraryDemandAdTagList',
                        templateUrl: 'videoLibrary/demandAdTag/libraryDemandAdTagList.tpl.html'
                    }
                },
                resolve: {
                    demandAdTags: /* @ngInject */ function(VideoDemandPartnerManager, $stateParams) {
                        return VideoDemandPartnerManager.one($stateParams.id).one('libraryvideodemandadtags').getList();
                    },
                    demandPartner: function($stateParams, VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Ad Tags'
                }
            })
            .state('videoLibrary.demandAdTag.new', {
                url: '/new?demandPartnerId',
                views: {
                    'content@app': {
                        controller: 'LibraryDemandAdTagForm',
                        templateUrl: 'videoLibrary/demandAdTag/libraryDemandAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    demandAdTag: function() {
                        return null;
                    },
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.getList().then(function (demandPartners) {
                            return demandPartners.plain();
                        });
                    },
                    demandPartner: /* @ngInject */ function(VideoDemandPartnerManager, $stateParams) {
                        if(!$stateParams.demandPartnerId) {
                            return null
                        }

                        return VideoDemandPartnerManager.one($stateParams.demandPartnerId).get();
                    },
                    waterfallTags: function(VideoAdTagManager) {
                        return VideoAdTagManager.getList();
                    },
                    videoPublishers: function(VideoPublisherManager) {
                        return VideoPublisherManager.getList();
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
                    label: 'New Demand Ad Tag'
                }
            })
            .state('videoLibrary.demandAdTag.edit', {
                url: '/edit/{id:[0-9]+}?demandPartnerId',
                views: {
                    'content@app': {
                        controller: 'LibraryDemandAdTagForm',
                        templateUrl: 'videoLibrary/demandAdTag/libraryDemandAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    demandAdTag: /* @ngInject */ function($stateParams, LibraryDemandAdTagManager) {
                        return LibraryDemandAdTagManager.one($stateParams.id).get()
                    },
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.getList().then(function (demandPartners) {
                            return demandPartners.plain();
                        });
                    },
                    demandPartner: /* @ngInject */ function(VideoDemandPartnerManager, $stateParams) {
                        if(!$stateParams.demandPartnerId) {
                            return null
                        }

                        return VideoDemandPartnerManager.one($stateParams.demandPartnerId).get();
                    },
                    waterfallTags: function(VideoAdTagManager) {
                        return VideoAdTagManager.getList();
                    },
                    videoPublishers: function(VideoPublisherManager) {
                        return VideoPublisherManager.getList();
                    },
                    blackList: function(BlackListManager) {
                        return BlackListManager.getList()
                    },
                    whiteList: function(WhiteListManager) {
                        return WhiteListManager.getList()
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Demand Ad Tag'
                }
            })
        ;
    }
})();