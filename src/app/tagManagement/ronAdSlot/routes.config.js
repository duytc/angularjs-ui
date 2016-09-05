(function() {
    'use strict';

    angular.module('tagcade.tagManagement.ronAdSlot')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.ronAdSlot', {
                abstract: true,
                url: '/ronAdSlots',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.ronAdSlot.list', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'RonAdSlotList',
                        templateUrl: 'tagManagement/ronAdSlot/ronAdSlotList.tpl.html'
                    }
                },
                resolve: {
                    ronAdSlots: /* @ngInject */ function(RonAdSlotManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return RonAdSlotManager.one().get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'RON Ad Slots'
                }
            })
            .state('tagManagement.ronAdSlot.new', {
                url: '/new?libraryAdSlotId',
                views: {
                    'content@app': {
                        controller: 'RonAdSlotForm',
                        templateUrl: 'tagManagement/ronAdSlot/ronAdSlotForm.tpl.html'
                    }
                },
                resolve: {
                    ronAdSlot: function() {
                        return null;
                    },
                    adSlotLibraryList: /* @ngInject */ function(AdSlotLibrariesManager) {
                        return AdSlotLibrariesManager.getList({forRon: true});
                    },
                    libraryAdSlot: function(adSlotLibraryList, $stateParams) {
                        for(var index in adSlotLibraryList) {
                            if(adSlotLibraryList[index].id == $stateParams.libraryAdSlotId) {
                                return adSlotLibraryList[index];
                            }
                        }

                        return null
                    },
                    segments: function(SegmentManager) {
                        return SegmentManager.getList().then(function (segments) {
                            return segments.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New RON Ad Slot'
                }
            })
            .state('tagManagement.ronAdSlot.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'RonAdSlotForm',
                        templateUrl: 'tagManagement/ronAdSlot/ronAdSlotForm.tpl.html'
                    }
                },

                resolve: {
                    ronAdSlot: /* @ngInject */ function($stateParams, RonAdSlotManager) {
                        return RonAdSlotManager.one($stateParams.id).get();
                    },
                    adSlotLibraryList: /* @ngInject */ function() {
                        return null;
                    },
                    libraryAdSlot: function() {
                        return null
                    },
                    segments: function(SegmentManager) {
                        return SegmentManager.getList().then(function (segments) {
                            return segments.plain();
                        });
                    },
                    publisherList: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit RON Ad Slot'
                }
            })
        ;
    }
})();