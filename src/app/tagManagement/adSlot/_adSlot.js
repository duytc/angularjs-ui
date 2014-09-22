angular.module('tagcade.tagManagement.adSlot', [
    'ui.router'
])

    .config(function (userStateHelperProvider) {
        'use strict';

        userStateHelperProvider
            .state('tagManagement.adSlot', {
                abstract: true,
                url: '/adSlots',
                resolve: {
                    sites: function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    }
                }
            })
            .state('tagManagement.adSlot.list', {
                url: '/list/site/{siteId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotListController',
                        templateUrl: 'tagManagement/adSlot/views/list.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: function($stateParams, SiteManager, AdSlotManager) {
                        return SiteManager.one($stateParams.siteId).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    site: function ($stateParams, SiteManager) {
                        return SiteManager.one($stateParams.siteId).get().then(function (site) {
                            return site.plain();
                        });
                    }
                },
                breadcrumb: {
                    title: 'Ad Slot List - {{ site.name }}'
                }
            })
            .state('tagManagement.adSlot.new', {
                url: '/new?siteId',
                views: {
                    'content@app': {
                        controller: 'AdSlotFormController',
                        templateUrl: 'tagManagement/adSlot/views/form.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function() {
                        return null;
                    }
                },
                breadcrumb: {
                    title: 'New Ad Slot'
                }
            })
            .state('tagManagement.adSlot.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotFormController',
                        templateUrl: 'tagManagement/adSlot/views/form.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.id).get();
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Slot - {{ adSlot.name }}'
                }
            })
        ;
    })

;