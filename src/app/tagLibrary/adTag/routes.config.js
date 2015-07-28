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
            .state('app.publisher.tagLibrary.adTag.associatedAdTags', {
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
        ;
    }
})();