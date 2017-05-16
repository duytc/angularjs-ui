(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, USER_MODULES, STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetworks',
                data: {
                    requiredModule: USER_MODULES.displayAds,
                    demandSourceTransparency: STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION.hide
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.adNetwork.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdNetworkList',
                        templateUrl: 'tagManagement/adNetwork/adNetworkList.tpl.html'
                    }
                },
                resolve: {
                    adNetworks: /* @ngInject */ function(AdNetworkCache) {
                        return AdNetworkCache.getAllAdNetworks();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Partners'
                }

            })
            .state('tagManagement.adNetwork.listByBlack', {
                url: 'BlackList/{id:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdNetworkList',
                        templateUrl: 'tagManagement/adNetwork/adNetworkList.tpl.html'
                    }
                },
                resolve: {
                    adNetworks: /* @ngInject */ function(DisplayBlackListManager, $stateParams) {
                        return DisplayBlackListManager.one($stateParams.id).one('adnetworks').getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    },
                    blackList: function (DisplayBlackListManager, $stateParams) {
                        return DisplayBlackListManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Demand Partners - {{ blackList.name }}'
                }

            })
            .state('tagManagement.adNetwork.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'AdNetworkForm',
                        templateUrl: 'tagManagement/adNetwork/adNetworkForm.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: function() {
                        return null;
                    },
                    blockList: function (DisplayBlackListManager) {
                        return DisplayBlackListManager.getList()
                            .then(function (blockList) {
                                return blockList.plain()
                            });
                    },
                    whiteList: function (DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList()
                            .then(function (whiteList) {
                                return whiteList.plain()
                            });
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
                    label: 'New Demand Partner'
                }
            })
            .state('tagManagement.adNetwork.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdNetworkForm',
                        templateUrl: 'tagManagement/adNetwork/adNetworkForm.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: /* @ngInject */ function($stateParams, AdNetworkCache) {
                        return AdNetworkCache.getAdNetworkById($stateParams.id);
                    },
                    blockList: function (DisplayBlackListManager) {
                        return DisplayBlackListManager.getList()
                            .then(function (blockList) {
                                return blockList.plain()
                            });
                    },
                    whiteList: function (DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList()
                            .then(function (whiteList) {
                                return whiteList.plain()
                            });
                    }
                },
                customResolve: {
                    admin: {
                        publishers: function() {
                            return null;
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Demand Partner - {{ adNetwork.name }}'
                }
            })
        ;
    }
})();