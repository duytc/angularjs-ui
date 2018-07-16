(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.alert', {
                abstract: true,
                url: '/alerts',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.alert.list', {
                url: '/list?page&sortField&orderBy&publisher&source&id',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AlertList',
                        templateUrl: 'unifiedReport/alert/alertList.tpl.html'
                    }
                },
                resolve: {
                    alerts: /* @ngInject */ function(UnifiedReportAlertManager, UnifiedReportDataSourceManager, $stateParams,UnifiedAlertRestAngular) {
                        // if($stateParams.dataSourceId) {
                        //     return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).getList('alerts');
                        // }

                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'createdDate' : $stateParams.sortField;
                        $stateParams.limit = 10;
                        $stateParams.publisher = !$stateParams.publisher ? null : $stateParams.publisher;
                        $stateParams.source = !$stateParams.source ? 'all' : $stateParams.source;
                        $stateParams.id = !$stateParams.id ? null : $stateParams.id; //data source id/ optimization integration id
                        $stateParams.types = !$stateParams.types ? 'info,warning,error,actionRequired' : $stateParams.types;
                        // var getParam = angular.copy($stateParams);
                        // getParam.source = !getParam.source ? 'all' : getParam.source;
                        // getParam.id = !getParam.id ? null : getParam.id;
                        // getParam.types = !getParam.types ? 'info,warning,error,actionRequired' : getParam.types;

                        return UnifiedAlertRestAngular.one('list').get($stateParams).then(function (alerts) {
                            return alerts.plain();
                        });
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.getList().then(function (dataSources) {
                            return dataSources.plain();
                        });
                    },
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList().then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    optimizeIntegrationList: function (AutoOptimizeIntegrationManager) {

                        return AutoOptimizeIntegrationManager.one().get().then(function (optimizeRules) {
                            return optimizeRules.plain();
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
                    label: 'Alerts'
                }
            })
    }
})();