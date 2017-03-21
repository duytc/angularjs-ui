(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.domainList', {
                abstract: true,
                url: '/blockList',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.domainList.blockList', {
                url: '/list?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'BlockList',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(BlockListManager) {
                        return BlockListManager.getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    adNetwork: /* @ngInject */ function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Black List'
                }
            })
            .state('tagManagement.domainList.listByAdNetwork', {
                url: '/adNetwork/{id:[0-9]+}?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'BlockList',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(AdNetworkManager, $stateParams) {
                        return AdNetworkManager.one($stateParams.id).one('displayblacklists').getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    adNetwork: /* @ngInject */ function($stateParams, AdNetworkCache) {
                        return AdNetworkCache.getAdNetworkById($stateParams.id);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Black List - {{ adNetwork.name }}'
                }
            })
            .state('tagManagement.domainList.newBlockList', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'BlockListForm',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: function() {
                        return null;
                    },
                    adNetworks: /* @ngInject */ function(AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
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
                    label: 'New Black List'
                }
            })
            .state('tagManagement.domainList.editBlockList', {
                url: '/edit/{id:[0-9]+}?adNetworkId',
                views: {
                    'content@app': {
                        controller: 'BlockListForm',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: /* @ngInject */ function($stateParams, BlockListManager) {
                        return BlockListManager.one($stateParams.id).get();
                    },
                    adNetworks: /* @ngInject */ function(AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Black List - {{ domain.name }}'
                }
            })
        ;
    }
})();