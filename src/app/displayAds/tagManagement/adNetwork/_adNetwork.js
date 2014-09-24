angular.module('tagcade.displayAds.tagManagement.adNetwork', [
    'ui.router',
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('displayAds.tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetworks'
            })
            .state('displayAds.tagManagement.adNetwork.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'AdNetworkListController',
                        templateUrl: 'displayAds/tagManagement/adNetwork/views/list.tpl.html'
                    }
                },
                resolve: {
                    adNetworks: function(AdNetworkManager) {
                        return AdNetworkManager.getList();
                    }
                },
                breadcrumb: {
                    title: 'Ad Networks'
                }

            })
            .state('displayAds.tagManagement.adNetwork.new', {
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
                        publishers: function(AdminUserManager) {
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
            .state('displayAds.tagManagement.adNetwork.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdNetworkFormController',
                        templateUrl: 'displayAds/tagManagement/adNetwork/views/form.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: function($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.id).get();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: function(AdminUserManager) {
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