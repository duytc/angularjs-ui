(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.autoOptimizeIntegration', {
                abstract: true,
                url: '/autoOptimizeIntegrations',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.autoOptimizeIntegration.list', {
                url: '/optimizationrule/{optimizationRuleId:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AutoOptimizeIntegrationList',
                        templateUrl: 'unifiedReport/autoOptimizeIntegration/autoOptimizeIntegrationList.tpl.html'
                    }
                },
                resolve: {
                    autoOptimizeIntegrations: /* @ngInject */ function (AutoOptimizeIntegrationManager, $stateParams) {
                        return AutoOptimizeIntegrationManager.getList({optimizationRule: $stateParams.optimizationRuleId})
                            .then(function (autoOptimizeIntegrations) {
                                return autoOptimizeIntegrations.plain();
                            });
                    },
                    optimizationRule: function (AutoOptimizationManager, $stateParams){
                        return AutoOptimizationManager.one($stateParams.optimizationRuleId).get()
                            .then(function (optimizeRule){
                                return optimizeRule;
                            });
                    },
                    sites: function (SiteManager) {
                        return SiteManager.getList()
                            .then(function (sites) {
                                return sites.plain()
                            })
                    }
                },
                ncyBreadcrumb: {
                    label: 'Optimize Integrations'
                }
            })
            .state('unifiedReport.autoOptimizeIntegration.new', {
                url: '/optimizationrule/{optimizationRuleId:[0-9]+}/new',
                views: {
                    'content@app': {
                        controller: 'AutoOptimizeIntegrationForm',
                        templateUrl: 'unifiedReport/autoOptimizeIntegration/autoOptimizeIntegrationForm.tpl.html'
                    }
                },
                resolve: {
                    autoOptimizeIntegration: function() {
                        return null;
                    },
                    autoOptimizeConfigs: function (AutoOptimizationManager) {
                        return AutoOptimizationManager.getList();
                    },
                    sites: function (SiteManager) {
                        return SiteManager.getList()
                            .then(function (sites) {
                                return sites.plain()
                            })
                    },
                    videoPublishers: function (VideoPublisherManager) {
                        return VideoPublisherManager.getList()
                            .then(function(videoPublishers) {
                                return videoPublishers.plain();
                            })
                    },
                    selectedSites: function () {
                        return null;
                    },
                    selectedAdSlots: function () {
                        return null;
                    },
                    optimizationRule: function (AutoOptimizationManager, $stateParams){
                        return AutoOptimizationManager.one($stateParams.optimizationRuleId).get()
                            .then(function (optimizeRule){
                                return optimizeRule;
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
                    label: 'New Optimize Integration'
                }
            })
            .state('unifiedReport.autoOptimizeIntegration.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AutoOptimizeIntegrationForm',
                        templateUrl: 'unifiedReport/autoOptimizeIntegration/autoOptimizeIntegrationForm.tpl.html'
                    }
                },
                resolve: {
                    autoOptimizeIntegration: /* @ngInject */ function($stateParams, AutoOptimizeIntegrationManager) {
                        return AutoOptimizeIntegrationManager.one($stateParams.id).get();
                    },
                    autoOptimizeConfigs: function (AutoOptimizationManager) {
                        return AutoOptimizationManager.getList();
                    },
                    publishers: function() {
                        return null;
                    },
                    sites: function (SiteManager) {
                        return SiteManager.getList()
                            .then(function (sites) {
                                return sites.plain()
                            })
                    },
                    selectedSites: function () {
                        return null;
                    },
                    selectedAdSlots: function () {
                        return null;
                    },
                    optimizationRule: /* @ngInject */ function(autoOptimizeIntegration) {
                        return autoOptimizeIntegration.optimizationRule;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Optimize Integration - {{ autoOptimizeIntegration.name }}'
                }
            })
        ;
    }
})();