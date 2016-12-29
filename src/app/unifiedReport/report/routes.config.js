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
                url: '/edit/?reportView&reportViews&dataSets&transforms&weightedCalculations&showInTotal&joinBy&name&alias&publisher&formats&showDataSetName&multiView&subReportsIncluded',
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
                                    return {
                                        dataSets: !!$stateParams.dataSets ? angular.fromJson($stateParams.dataSets) : reportView.dataSets,
                                        reportViews: !!$stateParams.reportViews ? angular.fromJson($stateParams.reportViews) : reportView.reportViews,
                                        transforms: !!$stateParams.transforms ? angular.fromJson($stateParams.transforms) : reportView.transforms,
                                        showInTotal: !!$stateParams.showInTotal ? angular.fromJson($stateParams.showInTotal) : reportView.showInTotal,
                                        formats: !!$stateParams.formats ? angular.fromJson($stateParams.formats) : reportView.formats,
                                        weightedCalculations: !!$stateParams.weightedCalculations ? angular.fromJson($stateParams.weightedCalculations) : reportView.weightedCalculations,
                                        joinBy: !!$stateParams.joinBy ? $stateParams.joinBy : reportView.joinBy,
                                        name: !!$stateParams.name ? $stateParams.name : reportView.name,
                                        alias: !!$stateParams.alias ? $stateParams.alias : reportView.alias,
                                        id: reportView.id,
                                        multiView: !!$stateParams.multiView ? ($stateParams.multiView == 'true') : reportView.multiView,
                                        subReportsIncluded: !!$stateParams.subReportsIncluded ? ($stateParams.subReportsIncluded == 'true') : reportView.subReportsIncluded,
                                      //  showDataSetName: !!$stateParams.showDataSetName ? ($stateParams.showDataSetName == 'true') : reportView.showDataSetName,
                                        publisher: reportView.publisher.id || reportView.publisher
                                    }
                                })
                        }

                        return {
                            dataSets: angular.fromJson($stateParams.dataSets),
                            reportViews: angular.fromJson($stateParams.reportViews),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            formats: angular.fromJson($stateParams.formats),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            joinBy: $stateParams.joinBy || null,
                            name: $stateParams.name,
                            alias: $stateParams.alias,
                            publisher: $stateParams.publisher,
                            multiView: $stateParams.multiView == 'true',
                            subReportsIncluded: $stateParams.subReportsIncluded == 'true'
                           // showDataSetName: $stateParams.showDataSetName == 'true'

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
                url: '/detail?reportView&reportViews&dataSets&filters&transforms&weightedCalculations&showInTotal&joinBy&name&alias&publisher&formats&multiView&fieldTypes&showDataSetName&subReportsIncluded&saveReportView',
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
                                    return {
                                        dataSets: !!$stateParams.dataSets ? angular.fromJson($stateParams.dataSets) : reportView.dataSets,
                                        reportViews: !!$stateParams.reportViews ? angular.fromJson($stateParams.reportViews) : reportView.reportViews,
                                        transforms: !!$stateParams.transforms ? angular.fromJson($stateParams.transforms) : reportView.transforms,
                                        showInTotal: !!$stateParams.showInTotal ? angular.fromJson($stateParams.showInTotal) : reportView.showInTotal,
                                        formats: !!$stateParams.formats ? angular.fromJson($stateParams.formats) : reportView.formats,
                                        fieldTypes: !!$stateParams.fieldTypes ? angular.fromJson($stateParams.fieldTypes) : reportView.fieldTypes,
                                        weightedCalculations: !!$stateParams.weightedCalculations ? angular.fromJson($stateParams.weightedCalculations) : reportView.weightedCalculations,
                                        joinBy: !!$stateParams.joinBy ? $stateParams.joinBy : reportView.joinBy,
                                        name: !!$stateParams.name ? $stateParams.name : reportView.name,
                                        alias: !!$stateParams.alias ? $stateParams.alias : reportView.alias,
                                        id: reportView.id,
                                        publisher: reportView.publisher.id || reportView.publisher,
                                        multiView: !!$stateParams.multiView ? ($stateParams.multiView == 'true') : reportView.multiView,
                                        subReportsIncluded: !!$stateParams.subReportsIncluded ? ($stateParams.subReportsIncluded == 'true') : reportView.subReportsIncluded
                                      //  showDataSetName: !!$stateParams.showDataSetName ? ($stateParams.showDataSetName == 'true') : reportView.showDataSetName

                                    }
                                })
                        }

                        return {
                            dataSets: angular.fromJson($stateParams.dataSets),
                            fieldTypes: angular.fromJson($stateParams.fieldTypes),
                            reportViews: angular.fromJson($stateParams.reportViews),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            formats: angular.fromJson($stateParams.formats),
                            joinBy: $stateParams.joinBy || null,
                            name: $stateParams.name,
                            alias: $stateParams.alias,
                            publisher: $stateParams.publisher,
                            multiView: $stateParams.multiView == 'true',
                            subReportsIncluded: $stateParams.subReportsIncluded == 'true'
                           // showDataSetName: $stateParams.showDataSetName == 'true'
                        };
                    },
                    reportGroup: /* @ngInject */ function(unifiedReportBuilder, reportView) {
                        var params = {
                            dataSets: angular.toJson(reportView.dataSets),
                            fieldTypes: angular.toJson(reportView.fieldTypes),
                            reportViews: angular.toJson(reportView.reportViews),
                            transforms: angular.toJson(reportView.transforms),
                            showInTotal: angular.toJson(reportView.showInTotal),
                            weightedCalculations: angular.toJson(reportView.weightedCalculations),
                            formats: angular.toJson(reportView.formats),
                            joinBy: reportView.joinBy || null,
                            name: reportView.name,
                            alias: reportView.alias,
                            multiView: !!reportView.multiView || reportView.multiView == 'true',
                            subReportsIncluded: !!reportView.subReportsIncluded || reportView.subReportsIncluded == 'true'
                           // showDataSetName: !!reportView.showDataSetName || reportView.showDataSetName == 'true'
                        };

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