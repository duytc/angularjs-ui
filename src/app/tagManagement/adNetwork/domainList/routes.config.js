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
                url: '/domainList',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.domainList.blockList', {
                url: '/blockList?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'BlockList',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(DisplayBlackListManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;

                        return DisplayBlackListManager.one().get($stateParams).then(function (blockList) {
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
            .state('tagManagement.domainList.whiteList', {
                url: '/whiteList?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'WhiteList',
                        templateUrl: 'tagManagement/adNetwork/domainList/whiteList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(DisplayWhiteListManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;

                        return DisplayWhiteListManager.one().get($stateParams).then(function (whiteList) {
                            return whiteList.plain();
                        });
                    },
                    adNetwork: /* @ngInject */ function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'White List'
                }
            })

            .state('tagManagement.domainList.blockListByAdNetwork', {
                url: '/blockList/adNetwork/{id:[0-9]+}?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'BlockList',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(AdNetworkManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;

                        return AdNetworkManager.one($stateParams.id).one('displayblacklists').get($stateParams).then(function (blockList) {
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
            .state('tagManagement.domainList.whiteListByAdNetwork', {
                url: '/whiteList/adNetwork/{id:[0-9]+}?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'WhiteList',
                        templateUrl: 'tagManagement/adNetwork/domainList/whiteList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(AdNetworkManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;

                        return AdNetworkManager.one($stateParams.id).one('displaywhitelists').get($stateParams).then(function (whiteList) {
                            return whiteList.plain();
                        });
                    },
                    adNetwork: /* @ngInject */ function($stateParams, AdNetworkCache) {
                        return AdNetworkCache.getAdNetworkById($stateParams.id);
                    }
                },
                ncyBreadcrumb: {
                    label: 'White List - {{ adNetwork.name }}'
                }
            })

            .state('tagManagement.domainList.newBlockList', {
                url: '/newBlockList',
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
            .state('tagManagement.domainList.newWhiteList', {
                url: '/newWhiteList',
                views: {
                    'content@app': {
                        controller: 'WhiteListForm',
                        templateUrl: 'tagManagement/adNetwork/domainList/whiteListForm.tpl.html'
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
                    label: 'New White List'
                }
            })

            .state('tagManagement.domainList.editBlockList', {
                url: '/editBlockList/{id:[0-9]+}?adNetworkId',
                views: {
                    'content@app': {
                        controller: 'BlockListForm',
                        templateUrl: 'tagManagement/adNetwork/domainList/blockListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: /* @ngInject */ function($stateParams, DisplayBlackListManager) {
                        return DisplayBlackListManager.one($stateParams.id).get();
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
            .state('tagManagement.domainList.editWhiteList', {
                url: '/editWhiteList/{id:[0-9]+}?adNetworkId',
                views: {
                    'content@app': {
                        controller: 'WhiteListForm',
                        templateUrl: 'tagManagement/adNetwork/domainList/whiteListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: /* @ngInject */ function($stateParams, DisplayWhiteListManager) {
                        return DisplayWhiteListManager.one($stateParams.id).get();
                    },
                    adNetworks: /* @ngInject */ function(AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit White List - {{ domain.name }}'
                }
            })
        ;
    }
})();