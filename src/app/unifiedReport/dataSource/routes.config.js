(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.dataSource', {
                abstract: true,
                url: '/dataSources',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.dataSource.list', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'DataSourceList',
                        templateUrl: 'unifiedReport/dataSource/dataSourceList.tpl.html'
                    }
                },
                resolve: {
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'lastActivity' : $stateParams.sortField;

                        return UnifiedReportDataSourceManager.one().get($stateParams).then(function (dataSources) {
                            return dataSources.plain();
                        });
                    },
                    publisher: function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Data Sources'
                }
            })
            .state('unifiedReport.dataSource.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'DataSourceForm',
                        templateUrl: 'unifiedReport/dataSource/dataSourceForm.tpl.html'
                    }
                },
                resolve: {
                    dataSource: function() {
                        return null;
                    },
                    integrations: /* @ngInject */ function(UnifiedReportIntegrationManager) {
                        return UnifiedReportIntegrationManager.getList().then(function (integrations) {
                            return integrations.plain();
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
                    label: 'New Data Source'
                }
            })
            .state('unifiedReport.dataSource.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'DataSourceForm',
                        templateUrl: 'unifiedReport/dataSource/dataSourceForm.tpl.html'
                    }
                },
                resolve: {
                    dataSource: /* @ngInject */ function($stateParams, UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.one($stateParams.id).get();
                    },
                    integrations: /* @ngInject */ function(UnifiedReportIntegrationManager) {
                        return UnifiedReportIntegrationManager.getList().then(function (integrations) {
                            return integrations.plain();
                        });
                    },
                    publishers: function() {
                        return null;
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return null;
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit data source - {{ dataSource.name }}'
                }
            })
        ;
    }
})();