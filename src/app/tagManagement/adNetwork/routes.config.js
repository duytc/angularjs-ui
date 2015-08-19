(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, USER_MODULES) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetworks',
                data: {
                    requiredModule: USER_MODULES.displayAds
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
                    adNetworks: /* @ngInject */ function(AdNetworkManager) {
                        return AdNetworkManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Networks'
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
                    label: 'New Ad Network'
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
                    adNetwork: /* @ngInject */ function($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.id).get();
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
                    label: 'Edit Ad Network - {{ adNetwork.name }}'
                }
            })
        ;
    }
})();