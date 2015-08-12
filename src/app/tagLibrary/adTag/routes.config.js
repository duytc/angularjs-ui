(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.tagLibrary.adTag', {
                abstract: true,
                url: '/adTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.publisher.tagLibrary.adTag.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'LibraryAdTagList',
                        templateUrl: 'tagLibrary/adTag/libraryAdTagList.tpl.html'
                    }
                },
                resolve: {
                    adTags: function(AdTagLibrariesManager) {
                        return AdTagLibrariesManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tag Library'
                },
                reloadOnSearch: false
            })
            .state('app.publisher.tagLibrary.adTag.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'LibraryAdTagForm',
                        templateUrl: 'tagLibrary/adTag/libraryAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: /* @ngInject */ function() {
                        return null;
                    },
                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
            .state('app.publisher.tagLibrary.adTag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'LibraryAdTagForm',
                        templateUrl: 'tagLibrary/adTag/libraryAdTagForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: /* @ngInject */ function($stateParams, AdTagLibrariesManager) {
                        return AdTagLibrariesManager.one($stateParams.id).get();
                    },
                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Tag'
                }
            })
            .state('app.publisher.tagLibrary.adTag.associated', {
                url: '/{adTagId:[0-9]+}/associated',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ViewAssociateAdTags',
                        templateUrl: 'tagLibrary/adTag/viewAssociateAdTags.tpl.html'
                    }
                },
                resolve: {
                    adTags: function(AdTagLibrariesManager, $stateParams) {
                        return AdTagLibrariesManager.one($stateParams.adTagId).getList('associatedadtags');
                    }
                },
                ncyBreadcrumb: {
                    label: 'Associated Ad Tags'
                }
            })
            .state('app.publisher.tagLibrary.adTag.nativeList', {
                url: '/native/list/{adSlotId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'NativeAdTagList',
                        templateUrl: 'tagManagement/adTag/nativeAdTagList.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function ($stateParams, NativeAdSlotLibrariesManager) {
                        return NativeAdSlotLibrariesManager.one($stateParams.adSlotId).get();
                    },
                    adTags: /* @ngInject */ function($stateParams, NativeAdSlotLibrariesManager) {
                        return NativeAdSlotLibrariesManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tags - {{ adSlot.name }}'
                }
            })
            .state('app.publisher.tagLibrary.adTag.displayList', {
                url: '/display/list/{adSlotId:[0-9]+}',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdTagList',
                        templateUrl: 'tagManagement/adTag/adTagList.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function ($stateParams, DisplayAdSlotLibrariesManager) {
                        return DisplayAdSlotLibrariesManager.one($stateParams.adSlotId).get();
                    },
                    adTags: /* @ngInject */ function($stateParams, DisplayAdSlotLibrariesManager) {
                        return DisplayAdSlotLibrariesManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Tags - {{ adSlot.name }}'
                }
            })
            .state('app.publisher.tagLibrary.adTag.newForAdSlot', {
                url: '/newForAdSlot?adSlotId',
                views: {
                    'content@app': {
                        controller: 'AdTagForAdSlotLibraryForm',
                        templateUrl: 'tagLibrary/adTag/adTagForAdSlotLibraryForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },
                    adSlot: /* @ngInject */ function ($stateParams, AdSlotLibrariesManager) {
                        if(!!$stateParams.adSlotId) {
                            return AdSlotLibrariesManager.one($stateParams.adSlotId).get();
                        }

                        return null;
                    },
                    adSlotList: function(AdSlotLibrariesManager) {
                        return AdSlotLibrariesManager.getList();
                    },
                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
            .state('app.publisher.tagLibrary.adTag.editForAdSlot', {
                url: '/editForAdSlot/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdTagForAdSlotLibraryForm',
                        templateUrl: 'tagLibrary/adTag/adTagForAdSlotLibraryForm.tpl.html'
                    }
                },
                resolve: {
                    adTag: function(AdSlotAdTagLibrariesManager, $stateParams) {
                        return AdSlotAdTagLibrariesManager.one($stateParams.id).get();
                    },
                    adSlot: /* @ngInject */ function (adTag) {
                        return adTag.libraryAdSlot;
                    },
                    adSlotList: function(AdSlotLibrariesManager) {
                        return AdSlotLibrariesManager.getList();
                    },
                    adNetworkList: /* @ngInject */ function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
        ;
    }
})();