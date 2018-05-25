(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, USER_MODULES) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.adSlot', {
                abstract: true,
                url: '/adSlots',
                data: {
                    requiredModule: USER_MODULES.displayAds
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.adSlot.list', {
                url: '/list/site/{siteId:[0-9]+}?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdSlotList',
                        templateUrl: 'tagManagement/adSlot/adSlotListBySite.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function($stateParams, SiteManager) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'name' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;

                        return SiteManager.one($stateParams.siteId).one('adslots').get($stateParams).then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },
                    site: /* @ngInject */ function ($stateParams, SiteCache) {
                        return SiteCache.getSiteById($stateParams.siteId);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slots - {{ site.name }}' // TODO cannot show site variable here, why?
                }
            })
            .state('tagManagement.adSlot.listAll', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdSlotList',
                        templateUrl: 'tagManagement/adSlot/adSlotList.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function(AdSlotManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return AdSlotManager.one().get($stateParams);
                    },

                    site: function () {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slots'
                }
            })
            .state('tagManagement.adSlot.listByChannel', {
                url: '/listByChannel?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AdSlotList',
                        templateUrl: 'tagManagement/adSlot/adSlotList.tpl.html'
                    }
                },
                resolve: {
                    // AdSlotManager is provided as a parameter to make sure the service is invoked
                    // because during init it attaches additional behaviour to the adslots resource
                    adSlots: /* @ngInject */ function(AdSlotManager) {
                        return AdSlotManager.one('relatedchannel').get({page: 1}).then(function (adSlots) {
                            return adSlots.plain();
                        });
                    },

                    site: function () {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Ad Slots'
                }
            })
            .state('tagManagement.adSlot.new', {
                url: '/new?siteId&deployment',
                views: {
                    'content@app': {
                        controller: 'AdSlotForm',
                        templateUrl: 'tagManagement/adSlot/adSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: function() {
                        return null;
                    },
                    blackList: /* @ngInject */ function(DisplayBlackListManager) {
                        return DisplayBlackListManager.getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    whiteList: /* @ngInject */ function(DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList().then(function (whiteList) {
                            return whiteList.plain();
                        });
                    },
                    optimizeIntegrations: function (AutoOptimizeIntegrationManager, $stateParams) {
                        return AutoOptimizeIntegrationManager.one().get()
                            .then(function (autoOptimizeIntegrations) {
                                autoOptimizeIntegrations = autoOptimizeIntegrations.plain();
                                if (!angular.isArray(autoOptimizeIntegrations)) {
                                    return [];
                                }

                                var autoOptimizeIntegrationsForPubvantagePlatform = [];
                                angular.forEach(autoOptimizeIntegrations, function (autoOptimizeIntegration) {
                                    if (!autoOptimizeIntegration
                                        || !autoOptimizeIntegration.platformIntegration
                                        || autoOptimizeIntegration.platformIntegration !== 'pubvantage'
                                    ) {
                                        return;
                                    }

                                    autoOptimizeIntegrationsForPubvantagePlatform.push(autoOptimizeIntegration);
                                });

                                return autoOptimizeIntegrationsForPubvantagePlatform;
                            });
                    }
                },
                customResolve: {
                    admin: {
                        publisherList: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Ad Slot'
                }
            })
            .state('tagManagement.adSlot.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdSlotForm',
                        templateUrl: 'tagManagement/adSlot/adSlotForm.tpl.html'
                    }
                },
                resolve: {
                    adSlot: /* @ngInject */ function($stateParams, AdSlotManager) {
                        return AdSlotManager.one($stateParams.id).get();
                    },
                    publisherList: function () {
                        return null;
                    },
                    blackList: /* @ngInject */ function(DisplayBlackListManager) {
                        return DisplayBlackListManager.getList().then(function (blockList) {
                            return blockList.plain();
                        });
                    },
                    whiteList: /* @ngInject */ function(DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList().then(function (whiteList) {
                            return whiteList.plain();
                        });
                    },
                    optimizeIntegrations: function (AutoOptimizeIntegrationManager, $stateParams) {
                        return AutoOptimizeIntegrationManager.one().get()
                            .then(function (autoOptimizeIntegrations) {
                                autoOptimizeIntegrations = autoOptimizeIntegrations.plain();
                                if (!angular.isArray(autoOptimizeIntegrations)) {
                                    return [];
                                }

                                var autoOptimizeIntegrationsForPubvantagePlatform = [];
                                angular.forEach(autoOptimizeIntegrations, function (autoOptimizeIntegration) {
                                    if (!autoOptimizeIntegration
                                        || !autoOptimizeIntegration.platformIntegration
                                        || autoOptimizeIntegration.platformIntegration !== 'pubvantage'
                                    ) {
                                        return;
                                    }

                                    autoOptimizeIntegrationsForPubvantagePlatform.push(autoOptimizeIntegration);
                                });

                                return autoOptimizeIntegrationsForPubvantagePlatform;
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Ad Slot - {{ adSlot.libraryAdSlot.name }}'
                }
            })
        ;
    }
})();