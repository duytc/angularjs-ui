angular.module('tagcade.displayAds.tagManagement.adSlot', [
    'ui.router'
])

    .config(function (UserStateHelperProvider, USER_MODULES) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement.adSlot', {
                abstract: true,
                url: '/adSlots',
                data: {
                    requiredModule: USER_MODULES.displayAds
                }
            })
            .state('tagManagement.adSlot.list', {
                url: '/list/site/{siteId:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotListController',
                        templateUrl: 'displayAds/tagManagement/adSlot/views/list.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function($stateParams, SiteManager, AdSlotManager) {
                        return SiteManager.one($stateParams.siteId).getList('adslots').then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    site: /* @ngInject */ function ($stateParams, SiteManager) {
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
                        templateUrl: 'displayAds/tagManagement/adSlot/views/form.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function() {
                        return null;
                    },

                    site: /* @ngInject */ function ($stateParams, SiteManager) {
                        if (!$stateParams.siteId) {
                            return null;
                        }

                        return SiteManager.one($stateParams.siteId).get().then(function (site) {
                            return site.plain();
                        });
                    },

                    siteList: /* @ngInject */ function(SiteManager) {
                        return SiteManager.getList().then(function (sites) {
                            return sites.plain();
                        });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: /* @ngInject */ function(AdminUserManager) {
                            return AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
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
                        templateUrl: 'displayAds/tagManagement/adSlot/views/form.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.id).get();
                    },

                    site: /* @ngInject */ function (adSlot) {
                        return adSlot.site;
                    },

                    publisherList: function () {
                        return null;
                    },

                    siteList: function() {
                        return null;
                    }
                },
                breadcrumb: {
                    title: 'Edit Ad Slot - {{ adSlot.name }}'
                }
            })
        ;
    })

;