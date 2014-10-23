angular.module('tagcade.displayAds.tagManagement.adNetwork', [
    'ui.router'
])

    .config(function (UserStateHelperProvider, USER_MODULES) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetworks',
                data: {
                    requiredModule: USER_MODULES.displayAds
                }
            })
            .state('tagManagement.adNetwork.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'AdNetworkListController',
                        templateUrl: 'displayAds/tagManagement/adNetwork/views/list.tpl.html'
                    }
                },
                resolve: {
                    adNetworks: /* @ngInject */ function(AdNetworkManager) {
                        return AdNetworkManager.getList();
                    }
                },
                breadcrumb: {
                    title: 'Ad Networks'
                }

            })
            .state('tagManagement.adNetwork.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'AdNetworkFormController',
                        templateUrl: 'displayAds/tagManagement/adNetwork/views/form.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: function() {
                        return null;
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'New Ad Network'
                }
            })
            .state('tagManagement.adNetwork.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdNetworkFormController',
                        templateUrl: 'displayAds/tagManagement/adNetwork/views/form.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: /* @ngInject */ function($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Network - {{ adNetwork.name }} '
                }
            })
        ;
    })

;