angular.module('tagcade.tagManagement.adTag', [
    'ui.router',

    'ui.sortable'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.adTag', {
                abstract: true,
                url: '/adTags'
            })
            .state('tagManagement.adTag.list', {
                url: '/list/adslot/{adSlotId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdTagListController',
                        templateUrl: 'tagManagement/adTag/views/list.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function ($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).get();
                    },

                    adTags: function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.adSlotId).getList('adtags').then(function (adTags) {
                            return adTags.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Ad Tag List - {{ adSlot.name }} - {{ adSlot.site.name }}'
                }
            })
            .state('tagManagement.adTag.new', {
                url: '/new?adSlotId',
                params: {
                    adSlotId: null
                },
                views: {
                    'content@app': {
                        controller: 'AdTagFormController',
                        templateUrl: 'tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function() {
                        return null;
                    },

                    siteList: function (SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    },

                    adNetworkList: function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                breadcrumb: {
                    title: 'New Ad Tag'
                }
            })
            .state('tagManagement.adTag.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdTagFormController',
                        templateUrl: 'tagManagement/adTag/views/form.tpl.html'
                    }
                },
                resolve: {
                    adTag: function($stateParams, AdTagManager) {
                        return AdTagManager.one($stateParams.id).get();
                    },

                    publisherList: function () {
                        return null;
                    },

                    siteList: function () {
                        return null;
                    },

                    adNetworkList: function (AdNetworkManager) {
                        return AdNetworkManager.getList().then(function (adNetworks) {
                            return adNetworks.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Tag - {{ adTag.name }}'
                }
            })
        ;
    })

;