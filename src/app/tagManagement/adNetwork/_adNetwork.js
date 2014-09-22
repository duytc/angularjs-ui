angular.module('tagcade.tagManagement.adNetwork', [
    'ui.router',
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetwork'
            })
            .state('tagManagement.adNetwork.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'AdNetworkListController',
                        templateUrl: 'tagManagement/adNetwork/views/list.tpl.html'
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
            .state('tagManagement.adNetwork.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'AdNetworkFormController',
                        templateUrl: 'tagManagement/adNetwork/views/form.tpl.html'
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
            .state('tagManagement.adNetwork.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdNetworkFormController',
                        templateUrl: 'tagManagement/adNetwork/views/form.tpl.html'
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