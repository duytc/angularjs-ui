(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.tagLibrary.adSlot', {
                abstract: true,
                url: '/adSlots',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.publisher.tagLibrary.adSlot.list', {
                url: '/display/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'LibraryAdSlotList',
                        templateUrl: 'tagLibrary/adSlot/views/libraryAdSlotList.tpl.html'
                    }
                },
                resolve: {
                    adSlots: function(AdSlotLibrariesManager) {
                        return AdSlotLibrariesManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slot Library'
                },
                reloadOnSearch: false
            })
            .state('app.publisher.tagLibrary.adSlot.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'LibraryAdSlotForm',
                        templateUrl: 'tagLibrary/adSlot/views/libraryAdSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function() {
                        return null;
                    },
                    adSlotType: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Slot'
                }
            })
            .state('app.publisher.tagLibrary.adSlot.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'LibraryAdSlotForm',
                        templateUrl: 'tagLibrary/adSlot/views/libraryAdSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function($stateParams, AdSlotLibrariesManager) {
                        return AdSlotLibrariesManager.one($stateParams.id).get();
                    },
                    adSlotType: function(adSlot) {
                        return adSlot.libType;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Slot - {{ adSlot.name }}'
                }
            })
            .state('app.publisher.tagLibrary.adSlot.associated', {
                url: '/{adSlotType}/{adSlotId:[0-9]+}/associated',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ViewAssociateAdSlots',
                        templateUrl: function($stateParams) {
                            if($stateParams.adSlotType == 'display')  {
                                return 'tagLibrary/adSlot/views/viewAssociateDisplayAdSlots.tpl.html';
                            }
                            if($stateParams.adSlotType == 'native') {
                                return 'tagLibrary/adSlot/views/viewAssociateNativeAdSlots.tpl.html';
                            }
                            if($stateParams.adSlotType == 'dynamic') {
                                return 'tagLibrary/adSlot/views/viewAssociateDynamicAdSlots.tpl.html';
                            }
                        }
                    }
                },
                resolve: {
                    adSlots: function($stateParams, TYPE_AD_SLOT, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager) {
                        var Manager;
                        if($stateParams.adSlotType == TYPE_AD_SLOT.display)  {
                            Manager = DisplayAdSlotLibrariesManager;
                        }
                        if($stateParams.adSlotType == TYPE_AD_SLOT.native) {
                            Manager = NativeAdSlotLibrariesManager;
                        }
                        if($stateParams.adSlotType == TYPE_AD_SLOT.dynamic) {
                            Manager = DynamicAdSlotLibrariesManager;
                        }

                        return Manager.one($stateParams.adSlotId).getList('associatedadslots');
                    }
                },
                ncyBreadcrumb: {
                    label: 'Associated Ad Slots'
                }
            })
        ;
    }
})();