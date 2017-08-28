(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.importHistory')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.importHistory', {
                abstract: true,
                url: '/importHistory',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.importHistory.list', {
                url: '/dataSet/{dataSetId:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ImportHistoryList',
                        templateUrl: 'unifiedReport/importHistory/importHistoryList.tpl.html'
                    }
                },
                resolve: {
                    importHistoryList: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'createdDate' : $stateParams.sortField;

                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).one('importhistories').get($stateParams).then(function (importHistoryList) {
                            return importHistoryList.plain();
                        });
                    },
                    dataSet: function (UnifiedReportDataSetManager, $stateParams) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).get();
                    },
                    dataSource: function () {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Loaded Data - {{ dataSet.name }}'
                }
            })
            .state('unifiedReport.importHistory.listForDataSource', {
                url: '/dataSourceId/{dataSourceId:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ImportHistoryList',
                        templateUrl: 'unifiedReport/importHistory/importHistoryList.tpl.html'
                    }
                },
                resolve: {
                    importHistoryList: /* @ngInject */ function(UnifiedReportDataSourceManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'createdDate' : $stateParams.sortField;

                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).one('importhistories').get($stateParams).then(function (importHistoryList) {
                            return importHistoryList.plain();
                        });
                    },
                    dataSet: function () {
                        return null
                    },
                    dataSource: function (UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Loaded Data - {{ dataSource.name }}'
                }
            })
        ;
    }
})();