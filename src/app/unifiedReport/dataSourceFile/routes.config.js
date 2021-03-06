(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.dataSourceFile', {
                abstract: true,
                url: '/dataSourceFiles',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.dataSourceFile.list', {
                url: '/list?page&sortField&orderBy&search&limit',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'DataSourceFileList',
                        templateUrl: 'unifiedReport/dataSourceFile/dataSourceFileList.tpl.html'
                    }
                },
                resolve: {
                    dataSource: function(UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).get();
                    },
                    dataSourceFiles: /* @ngInject */ function(UnifiedReportDataSourceFileManager, $stateParams, dataSource) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;
                        $stateParams.sortField = !$stateParams.sortField ? (dataSource.dateRangeDetectionEnabled ? 'endDate' :'receivedDate') : $stateParams.sortField;

                        return UnifiedReportDataSourceFileManager.one().get($stateParams).then(function (dataSourceFiles) {
                            return dataSourceFiles.plain();
                        });
                    },
                    allEntryIds: function(UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).one('datasourceentryids').getList()
                            .then(function (data) {
                                var ids = [];

                                angular.forEach(data, function (item) {
                                    ids.push(item.id);
                                });

                                return ids
                            });
                    },
                    publisher: function() {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Received Files'
                }
            })
            .state('unifiedReport.dataSourceFile.listForDataSource', {
                url: '/dataSource/{dataSourceId:[0-9]+}/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'DataSourceFileList',
                        templateUrl: 'unifiedReport/dataSourceFile/dataSourceFileList.tpl.html'
                    }
                },
                resolve: {
                    dataSource: function(UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).get();
                    },
                    dataSourceFiles: /* @ngInject */ function(UnifiedReportDataSourceManager, $stateParams, dataSource) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? (dataSource.dateRangeDetectionEnabled ? 'endDate' :'receivedDate') : $stateParams.sortField;

                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).customGET('datasourceentries', $stateParams).then(function (dataSourceFiles) {
                            return dataSourceFiles.plain();
                        });
                    },
                    allEntryIds: function(UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).one('datasourceentryids').getList()
                            .then(function (data) {
                                var ids = [];

                                angular.forEach(data, function (item) {
                                    ids.push(item.id);
                                });

                                return ids
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Imported Data for data source - {{dataSource.name }}'
                }
            })
            .state('unifiedReport.dataSourceFile.new', {
                url: '/new?dataSourceId',
                views: {
                    'content@app': {
                        controller: 'uploadFileForm',
                        templateUrl: 'unifiedReport/dataSourceFile/uploadFile.tpl.html'
                    }
                },
                resolve: {
                    dataSourceFiles: function() {
                        return null;
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.getList().then(function (dataSources) {
                            return dataSources;
                        });
                    },
                    dataSource: /* @ngInject */ ["UnifiedReportDataSourceManager", "$stateParams", function(UnifiedReportDataSourceManager, $stateParams) {
                        if(!$stateParams.dataSourceId) {
                            return null
                        }

                        return UnifiedReportDataSourceManager.one($stateParams.dataSourceId).get();
                    }]
                },
                ncyBreadcrumb: {
                    label: 'Upload new Received file'
                }
            })
            .state('unifiedReport.dataSourceFile.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'uploadFileForm',
                        templateUrl: 'unifiedReport/dataSourceFile/uploadFile.tpl.html'
                    }
                },
                resolve: {
                    dataSourceFile: /* @ngInject */ function($stateParams, UnifiedReportDataSourceFileManager) {
                        return UnifiedReportDataSourceFileManager.one($stateParams.id).get();
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager) {
                        return UnifiedReportDataSourceManager.getList().then(function (dataSources) {
                            return dataSources.plain();
                        });
                    }

                },
                ncyBreadcrumb: {
                    label: 'View detail received file - {{ dataSourceFile.path }}'
                }
            })
        ;
    }
})();