(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.autoOptimization', {
                abstract: true,
                url: '/autoOptimization',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.autoOptimization.list', {
                url: '/autoOptimizations?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AutoOptimizationList',
                        templateUrl: 'unifiedReport/autoOptimization/autoOptimizationList.tpl.html'
                    }
                },
                resolve: {
                    autoList: function (AutoOptimizationManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'createdDate' : $stateParams.sortField;
                        return AutoOptimizationManager.one().get($stateParams).then(function (optimizeRules) {
                            return optimizeRules;
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'My Optimization Rules'
                }
            })
            .state('unifiedReport.autoOptimization.builder', {
                url: '/builder',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'autoOptimizationBuilder',
                        templateUrl: 'unifiedReport/autoOptimization/autoOptimizationBuilder.tpl.html'
                    }
                },
                resolve: {
                    auto: function () {
                        return null
                    },
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function (adminUserManager) {
                            return adminUserManager.getList({filter: 'publisher'}).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Optimization Rule Builder'
                }
            })
            .state('unifiedReport.autoOptimization.editBuilder', {
                url: '/edit?id',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'autoOptimizationBuilder',
                        templateUrl: 'unifiedReport/autoOptimization/autoOptimizationBuilder.tpl.html'
                    }
                },
                resolve: {

                    auto: function (AutoOptimizationManager, $stateParams, UnifiedReportViewManager) {
                        if (!!$stateParams.id) {
                            return AutoOptimizationManager.one($stateParams.id).get()
                                .then(function (auto) {
                                    // get list report view by publisher
                                    var param = {
                                        "publisher": auto.publisher.id
                                    };
                                    return UnifiedReportViewManager.one().get(param)
                                        .then(function (reportViewList) {
                                            // auto.reportViewList = reportViewList.plain().records;
                                            auto.reportViewList = reportViewList.plain();
                                            return auto;
                                        }, function (error) {
                                            return auto;
                                        });

                                })
                        }
                        return null;
                    },
                    publishers: function () {
                        return null
                    },
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Optimization Rule'
                }
            })
            .state('unifiedReport.autoOptimization.viewRuleData', {
                url: '/detailRuleData?id',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ViewRuleData',
                        templateUrl: 'unifiedReport/autoOptimization/viewRuleData.tpl.html'
                    }
                },
                resolve: {
                    optimizeRule: function (AutoOptimizationManager, $stateParams) {
                        if (!!$stateParams.id) {
                            return AutoOptimizationManager.one($stateParams.id).get()
                                .then(function (auto) {
                                    return auto;
                                })
                        }
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'View Rule Data'
                }
            })
        ;
    }
})();