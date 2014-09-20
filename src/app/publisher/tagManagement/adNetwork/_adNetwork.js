angular.module('tagcade.publisher.tagManagement.adNetwork', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tagManagement.adNetwork', {
                abstract: true,
                url: '/adnetwork'
            })
            .state('app.publisher.tagManagement.adNetwork.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'PublisherAdNetworkListController',
                        templateUrl: 'publisher/tagManagement/adNetwork/views/list.tpl.html'
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
            .state('app.publisher.tagManagement.adNetwork.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'PublisherAdNetworkFormController',
                        templateUrl: 'publisher/tagManagement/adNetwork/views/form.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: function() {
                        return null;
                    }
                },
                breadcrumb: {
                    title: 'New Ad Network'
                }
            })
            .state('app.publisher.tagManagement.adNetwork.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'PublisherAdNetworkFormController',
                        templateUrl: 'publisher/tagManagement/adNetwork/views/form.tpl.html'
                    }
                },
                resolve: {
                    adNetwork: function($stateParams, AdNetworkManager) {
                        return AdNetworkManager.one($stateParams.id).get();
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Network - {{ adNetwork.name }} '
                }
            })
        ;
    })

;