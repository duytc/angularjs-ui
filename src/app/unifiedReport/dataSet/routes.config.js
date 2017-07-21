(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.dataSet', {
                abstract: true,
                url: '/dataSets',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.dataSet.list', {
                url: '/list?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'dataSetList',
                        templateUrl: 'unifiedReport/dataSet/dataSetList.tpl.html'
                    }
                },
                resolve: {
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'lastActivity' : $stateParams.sortField;

                        return UnifiedReportDataSetManager.one().get($stateParams).then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    dataSetPendingJobs: function (dataSets, UnifiedReportDataSetManager) {
                        var dataSetIds = [];
                        angular.forEach(dataSets.records, function (dataSet) {
                            dataSetIds.push(dataSet.id)
                        });

                        if(dataSetIds.length == 0) {
                            return []
                        }

                        return UnifiedReportDataSetManager.one('pendingjobs').get({ids: dataSetIds.toString()}).then(function (dataSetPendingJobs) {
                            return dataSetPendingJobs.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Data Sets'
                }
            })
            .state('unifiedReport.dataSet.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'dataSetForm',
                        templateUrl: 'unifiedReport/dataSet/dataSetForm.tpl.html'
                    }
                },
                resolve: {
                    dataSet: function() {
                        return null;
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager, $stateParams) {
                        return UnifiedReportDataSourceManager.getList().then(function (dataSources) {
                            return dataSources.plain();
                        });
                    },
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.one().getList().then(function (dataSets) {
                            return dataSets.plain();
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
                    label: 'New Data Set'
                }
            })
            .state('unifiedReport.dataSet.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'dataSetForm',
                        templateUrl: 'unifiedReport/dataSet/dataSetForm.tpl.html'
                    }
                },
                resolve: {
                    dataSet: /* @ngInject */ function($stateParams, UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.one($stateParams.id).get();
                    },
                    dataSources: /* @ngInject */ function(UnifiedReportDataSourceManager, $stateParams) {
                        //$stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        return UnifiedReportDataSourceManager.one().get($stateParams).then(function (dataSources) {
                            return dataSources.plain();
                        });
                    },
                    publishers: function() {
                        return null;
                    },
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.one().getList().then(function (dataSets) {
                            return dataSets.plain();
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
                    label: 'Edit data set - {{ dataSet.name }}'
                }
            })
            .state('unifiedReport.dataSet.mapBuilder', {
                url: '/{dataSet:[0-9]+}/mapBuilder',
                views: {
                    'content@app': {
                        controller: 'mapBuilderForm',
                        templateUrl: 'unifiedReport/dataSet/mapBuilderForm.tpl.html'
                    }
                },
                resolve: {
                    dataSet: /* @ngInject */ function($stateParams, UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.one($stateParams.dataSet).get();
                    },
                    dataRows: /* @ngInject */ function(UnifiedReportDataSetManager, $stateParams) {
                        var params = $stateParams;

                        params.page = !$stateParams.page ? 1 : $stateParams.page;
                        params.limit = !$stateParams.limit ? 10 : $stateParams.limit;

                        return UnifiedReportDataSetManager.one($stateParams.dataSet).one('rows').get(params)
                            .then(function (data) {
                                return data.plain()
                            });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Map Builder Data Set - {{ dataSet.name }}'
                }
            })
        ;
    }
})();