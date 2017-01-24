(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.report', {
                abstract: true,
                url: '/report',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.report.listReportView', {
                url: '/reportViews?page&sortField&orderBy&search',
                views: {
                    'content@app': {
                        controller: 'UnifiedReportView',
                        templateUrl: 'unifiedReport/report/unifiedReportView.tpl.html'
                    }
                },
                resolve: {
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified Report View'
                }
            })
            .state('unifiedReport.report.builder', {
                url: '/builder',
                views: {
                    'content@app': {
                        controller: 'UnifiedReportBuilder',
                        templateUrl: 'unifiedReport/report/unifiedReportBuilder.tpl.html'
                    }
                },
                resolve: {
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList({hasConnectedDataSource: true}).then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    reportViews: /* @ngInject */ function(UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList({multiView: false}).then(function (reportViews) {
                            return reportViews.plain();
                        });
                    },
                    reportView: function () {
                        return null
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
                    label: 'Unified Report Builder'
                }
            })
            .state('unifiedReport.report.editBuilder', {
                url: '/edit/?reportView&reportViewMultiViews&reportViewDataSets&transforms&weightedCalculations&showInTotal&joinBy&name&alias&publisher&formats&multiView&subReportsIncluded',
                views: {
                    'content@app': {
                        controller: 'UnifiedReportBuilder',
                        templateUrl: 'unifiedReport/report/unifiedReportBuilder.tpl.html'
                    }
                },
                resolve: {
                    dataSets: /* @ngInject */ function(UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList({hasConnectedDataSource: true}).then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    reportViews: /* @ngInject */ function(UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList({multiView: false}).then(function (reportViews) {
                            return reportViews.plain();
                        });
                    },
                    reportView: function (UnifiedReportViewManager, $stateParams) {
                        if(!!$stateParams.reportView) {
                            return UnifiedReportViewManager.one($stateParams.reportView).get()
                                .then(function (reportView) {
                                    angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                                        reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
                                    });

                                    angular.forEach(reportView.reportViewMultiViews, function (reportViewMultiView) {
                                        reportViewMultiView.subView = angular.isObject(reportViewMultiView.subView) ? reportViewMultiView.subView.id : reportViewMultiView.subView
                                    });

                                    return {
                                        reportViewDataSets: !!$stateParams.reportViewDataSets ? angular.fromJson($stateParams.reportViewDataSets) : reportView.reportViewDataSets,
                                        reportViewMultiViews: !!$stateParams.reportViewMultiViews ? angular.fromJson($stateParams.reportViewMultiViews) : reportView.reportViewMultiViews,
                                        transforms: !!$stateParams.transforms ? angular.fromJson($stateParams.transforms) : reportView.transforms,
                                        showInTotal: !!$stateParams.showInTotal ? angular.fromJson($stateParams.showInTotal) : reportView.showInTotal,
                                        formats: !!$stateParams.formats ? angular.fromJson($stateParams.formats) : reportView.formats,
                                        weightedCalculations: !!$stateParams.weightedCalculations ? angular.fromJson($stateParams.weightedCalculations) : reportView.weightedCalculations,
                                        joinBy: !!$stateParams.joinBy ? angular.fromJson($stateParams.joinBy) : reportView.joinBy,
                                        name: !!$stateParams.name ? $stateParams.name : reportView.name,
                                        alias: !!$stateParams.alias ? $stateParams.alias : reportView.alias,
                                        id: reportView.id,
                                        multiView: !!$stateParams.multiView ? ($stateParams.multiView == 'true') : reportView.multiView,
                                        subReportsIncluded: !!$stateParams.subReportsIncluded ? ($stateParams.subReportsIncluded == 'true') : reportView.subReportsIncluded,
                                        publisher: reportView.publisher.id || reportView.publisher
                                    }
                                })
                        }

                        return {
                            reportViewDataSets: angular.fromJson($stateParams.reportViewDataSets),
                            reportViewMultiViews: angular.fromJson($stateParams.reportViewMultiViews),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            formats: angular.fromJson($stateParams.formats),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            joinBy: angular.fromJson($stateParams.joinBy) || null,
                            name: $stateParams.name,
                            alias: $stateParams.alias,
                            publisher: $stateParams.publisher,
                            multiView: $stateParams.multiView == 'true',
                            subReportsIncluded: $stateParams.subReportsIncluded == 'true'
                        };
                    },
                    publishers: function () {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified Report Builder'
                }
            })
            .state('unifiedReport.report.detail', {
                url: '/detail?reportView&reportViewMultiViews&reportViewDataSets&filters&transforms&weightedCalculations&showInTotal&joinBy&name&alias&publisher&formats&multiView&fieldTypes&subReportsIncluded&saveReportView&startDate&endDate',
                views: {
                    'content@app': {
                        controller: 'UnifiedReportDetail',
                        templateUrl: 'unifiedReport/report/unifiedReportDetail.tpl.html'
                    }
                },
                resolve: {
                    reportView: function (UnifiedReportViewManager, $stateParams) {
                        if(!!$stateParams.reportView) {
                            return UnifiedReportViewManager.one($stateParams.reportView).get()
                                .then(function (reportView) {
                                    angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                                        reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
                                    });

                                    angular.forEach(reportView.reportViewMultiViews, function (reportViewMultiView) {
                                        reportViewMultiView.subView = angular.isObject(reportViewMultiView.subView) ? reportViewMultiView.subView.id : reportViewMultiView.subView
                                    });

                                    return {
                                        reportViewDataSets: !!$stateParams.reportViewDataSets ? angular.fromJson($stateParams.reportViewDataSets) : reportView.reportViewDataSets,
                                        reportViewMultiViews: !!$stateParams.reportViewMultiViews ? angular.fromJson($stateParams.reportViewMultiViews) : reportView.reportViewMultiViews,
                                        transforms: !!$stateParams.transforms ? angular.fromJson($stateParams.transforms) : reportView.transforms,
                                        showInTotal: !!$stateParams.showInTotal ? angular.fromJson($stateParams.showInTotal) : reportView.showInTotal,
                                        formats: !!$stateParams.formats ? angular.fromJson($stateParams.formats) : reportView.formats,
                                        fieldTypes: !!$stateParams.fieldTypes ? angular.fromJson($stateParams.fieldTypes) : reportView.fieldTypes,
                                        weightedCalculations: !!$stateParams.weightedCalculations ? angular.fromJson($stateParams.weightedCalculations) : reportView.weightedCalculations,
                                        joinBy: !!$stateParams.joinBy ? angular.fromJson($stateParams.joinBy) : reportView.joinBy,
                                        name: !!$stateParams.name ? $stateParams.name : reportView.name,
                                        alias: !!$stateParams.alias ? $stateParams.alias : reportView.alias,
                                        id: reportView.id,
                                        publisher: reportView.publisher.id || reportView.publisher,
                                        multiView: !!$stateParams.multiView ? ($stateParams.multiView == 'true') : reportView.multiView,
                                        subReportsIncluded: !!$stateParams.subReportsIncluded ? ($stateParams.subReportsIncluded == 'true') : reportView.subReportsIncluded
                                    }
                                })
                        }

                        return {
                            reportViewDataSets: angular.fromJson($stateParams.reportViewDataSets),
                            fieldTypes: angular.fromJson($stateParams.fieldTypes),
                            reportViewMultiViews: angular.fromJson($stateParams.reportViewMultiViews),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            formats: angular.fromJson($stateParams.formats),
                            joinBy: angular.fromJson($stateParams.joinBy) || null,
                            name: $stateParams.name,
                            alias: $stateParams.alias,
                            publisher: $stateParams.publisher,
                            multiView: $stateParams.multiView == 'true',
                            subReportsIncluded: $stateParams.subReportsIncluded == 'true'
                        };
                    },
                    reportGroup: /* @ngInject */ function(unifiedReportBuilder, reportView, $stateParams) {
                        var params = {
                            reportViewDataSets: angular.toJson(reportView.reportViewDataSets),
                            fieldTypes: angular.toJson(reportView.fieldTypes),
                            reportViewMultiViews: angular.toJson(reportView.reportViewMultiViews),
                            transforms: angular.toJson(reportView.transforms),
                            showInTotal: angular.toJson(reportView.showInTotal),
                            weightedCalculations: angular.toJson(reportView.weightedCalculations),
                            formats: angular.toJson(reportView.formats),
                            joinBy: angular.toJson(reportView.joinBy) || null,
                            name: reportView.name,
                            alias: reportView.alias,
                            multiView: !!reportView.multiView || reportView.multiView == 'true',
                            subReportsIncluded: !!reportView.subReportsIncluded || reportView.subReportsIncluded == 'true'
                        };

                        params.startDate = $stateParams.startDate;
                        params.endDate = $stateParams.endDate;

                        return unifiedReportBuilder.getPlatformReport(params);
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ reportView.name }}'
                }
            })
        ;
    }
})();