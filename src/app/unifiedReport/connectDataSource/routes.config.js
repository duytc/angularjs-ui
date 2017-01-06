(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.connect', {
                abstract: true,
                url: '/connect',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.connect.list', {
                url: '/dataset/{dataSetId:[0-9]+}/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ConnectDataSourceList',
                        templateUrl: 'unifiedReport/connectDataSource/connectDataSourceList.tpl.html'
                    }
                },
                resolve: {
                    dataSet: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).get();
                    },
                    connectDataSources: function(UnifiedReportDataSetManager, $stateParams) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).one('connecteddatasources').getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Connected Data Source'
                }
            })
            .state('unifiedReport.connect.new', {
                url: '/dataset/{dataSetId:[0-9]+}/new',
                views: {
                    'content@app': {
                        controller: 'ConnectDataSourceForm',
                        templateUrl: 'unifiedReport/connectDataSource/connectDataSourceForm.tpl.html'
                    }
                },
                resolve: {
                    connectDataSource: function() {
                        return null;
                    },
                    dataSet: function(UnifiedReportDataSetManager, $stateParams) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).get();
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSetId).one('datasources').getList(null, {connected: false});
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Connected Data Source'
                }
            })
            .state('unifiedReport.connect.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'ConnectDataSourceForm',
                        templateUrl: 'unifiedReport/connectDataSource/connectDataSourceForm.tpl.html'
                    }
                },
                resolve: {
                    connectDataSource: function(UnifiedReportConnectDataSourceManager, $stateParams) {
                        return UnifiedReportConnectDataSourceManager.one($stateParams.id).get();
                    },
                    dataSet: /* @ngInject */ function(connectDataSource) {
                        return connectDataSource.dataSet;
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams, dataSet, connectDataSource) {
                        return UnifiedReportDataSetManager.one(dataSet.id).one('datasources').getList(null, {connected: false})
                            .then(function (dataSources) {
                                return dataSources.plain().concat(connectDataSource.dataSource)
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Connected Data Source - {{ connectDataSource.dataSource.name }}'
                }
            })
        ;
    }
})();