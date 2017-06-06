(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagLibrary.adTag', {
                abstract: true,
                url: '/adTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagLibrary.adTag.list', {
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
                    adTags: function(AdTagLibrariesManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return AdTagLibrariesManager.one().get($stateParams)

                    }
                },
                ncyBreadcrumb: {
                    label: 'Standalone Ad Tags'
                }
            })
            .state('tagLibrary.adTag.new', {
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
                    adNetworkList: /* @ngInject */ function (AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    },
                    blackList: /* @ngInject */ function(DisplayBlackListManager) {
                        return DisplayBlackListManager.getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    whiteList: /* @ngInject */ function(DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList().then(function (whiteList) {
                            return whiteList.plain();
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
                    label: 'New Ad Tag'
                }
            })
            .state('tagLibrary.adTag.edit', {
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
                    adNetworkList: /* @ngInject */ function (AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    },
                    publisherList: function() {
                        return null;
                    },
                    blackList: /* @ngInject */ function(DisplayBlackListManager) {
                        return DisplayBlackListManager.getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    whiteList: /* @ngInject */ function(DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList().then(function (whiteList) {
                            return whiteList.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Tag'
                }
            })
            .state('tagLibrary.adTag.associated', {
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
                    label: 'Linked Ad Tags'
                }
            })
            .state('tagLibrary.adTag.nativeList', {
                url: '/native/list/{adSlotId:[0-9]+}?from',
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
            .state('tagLibrary.adTag.displayList', {
                url: '/display/list/{adSlotId:[0-9]+}?from',
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
            .state('tagLibrary.adTag.newForAdSlot', {
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
                    adNetworkList: /* @ngInject */ function (AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
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
                    label: 'New Ad Tag'
                }
            })
            .state('tagLibrary.adTag.editForAdSlot', {
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
                    adSlotList: function() {
                        return null;
                    },
                    adNetworkList: /* @ngInject */ function (AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    },
                    publisherList: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Tag'
                }
            })
        ;
    }
})();