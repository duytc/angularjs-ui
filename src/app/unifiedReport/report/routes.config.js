(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .config(addStates);

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
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'UnifiedReportView',
                        templateUrl: 'unifiedReport/report/unifiedReportView.tpl.html'
                    }
                },
                resolve: {

                    reportViewList: function (UnifiedReportViewManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'lastRun' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;

                        return UnifiedReportViewManager.one().get($stateParams).then(function (reportViewList) {
                            return reportViewList.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Report Views'
                }
            })
            .state('unifiedReport.report.builder', {
                url: '/builder',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'UnifiedReportBuilder',
                        templateUrl: 'unifiedReport/report/unifiedReportBuilder.tpl.html'
                    }
                },
                resolve: {
                    dataSets: /* @ngInject */ function (UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList().then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    editable: function () {
                        return true;
                    },
                    reportView: function () {
                        return null
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
                    label: 'Report Builder'
                }
            })
            .state('unifiedReport.report.editBuilder', {
                url: '/edit?id&filters&subView&masterReportView&reportViewDataSets&transforms&weightedCalculations&showInTotal&joinBy&name&publisher&formats&userReorderTransformsAllowed&preCalculateTable&largeReport&availableToRun&availableToChange&isShowDataSetName&enableCustomDimensionMetric',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'UnifiedReportBuilder',
                        templateUrl: 'unifiedReport/report/unifiedReportBuilder.tpl.html'
                    }
                },
                resolve: {
                    dataSets: /* @ngInject */ function (UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList().then(function (dataSets) {
                            return dataSets.plain();
                        });
                    },
                    editable: function (UnifiedReportViewManager, $stateParams) {
                        console.log('--');
                        if (!!$stateParams.id) {
                            var param = {
                                ids: [$stateParams.id]
                            };
                            return UnifiedReportViewManager.one("editable").get(param)
                                .then(function (data) {
                                    var result = data.plain();
                                    return result[$stateParams.id];
                                }, function (error) {
                                    return false;
                                });
                        }
                        return true;
                    },
                    reportView: function (UnifiedReportViewManager, $stateParams) {
                        if (!!$stateParams.id) {
                            return UnifiedReportViewManager.one($stateParams.id).get()
                                .then(function (reportView) {
                                    angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                                        reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
                                    });

                                    return {
                                        reportViewDataSets: !!$stateParams.reportViewDataSets ? angular.fromJson($stateParams.reportViewDataSets) : reportView.reportViewDataSets,
                                        transforms: !!$stateParams.transforms ? angular.fromJson($stateParams.transforms) : reportView.transforms,
                                        showInTotal: !!$stateParams.showInTotal ? angular.fromJson($stateParams.showInTotal) : reportView.showInTotal,
                                        formats: !!$stateParams.formats ? angular.fromJson($stateParams.formats) : reportView.formats,
                                        weightedCalculations: !!$stateParams.weightedCalculations ? angular.fromJson($stateParams.weightedCalculations) : reportView.weightedCalculations,
                                        filters: !!$stateParams.filters ? angular.fromJson($stateParams.filters) : reportView.filters,
                                        joinBy: !!$stateParams.joinBy ? angular.fromJson($stateParams.joinBy) : reportView.joinBy,
                                        name: !!$stateParams.name ? $stateParams.name : reportView.name,
                                        id: reportView.id,
                                        masterReportView: !!$stateParams.masterReportView ? angular.fromJson($stateParams.masterReportView) : reportView.masterReportView,
                                        isShowDataSetName: !!$stateParams.isShowDataSetName ? ($stateParams.isShowDataSetName == 'true') : reportView.isShowDataSetName,
                                        preCalculateTable: !!$stateParams.preCalculateTable ? $stateParams.preCalculateTable : reportView.preCalculateTable,
                                        largeReport: !!$stateParams.largeReport ? ($stateParams.largeReport == 'true') : reportView.largeReport,
                                        availableToRun: !!$stateParams.availableToRun ? ($stateParams.availableToRun == 'true') : reportView.availableToRun,
                                        availableToChange: !!$stateParams.availableToChange ? ($stateParams.availableToChange == 'true') : reportView.availableToChange,
                                        userReorderTransformsAllowed: !!$stateParams.userReorderTransformsAllowed ? ($stateParams.userReorderTransformsAllowed == 'true') : reportView.userReorderTransformsAllowed,
                                        publisher: reportView.publisher.id || reportView.publisher,
                                        enableCustomDimensionMetric: !!$stateParams.enableCustomDimensionMetric ? ($stateParams.enableCustomDimensionMetric == 'true') : reportView.enableCustomDimensionMetric,
                                        subView: !!$stateParams.subView ? ($stateParams.subView == 'true') : reportView.subView
                                    }
                                })
                        }

                        return {
                            id: $stateParams.id,
                            reportViewDataSets: angular.fromJson($stateParams.reportViewDataSets),
                            filters: angular.fromJson($stateParams.filters),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            formats: angular.fromJson($stateParams.formats),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            joinBy: angular.fromJson($stateParams.joinBy) || null,
                            name: $stateParams.name,
                            publisher: $stateParams.publisher,
                            isShowDataSetName: $stateParams.isShowDataSetName == 'true',
                            preCalculateTable: $stateParams.preCalculateTable,
                            largeReport: $stateParams.largeReport == 'true',
                            availableToRun: $stateParams.availableToRun == 'true',
                            availableToChange: $stateParams.availableToChange == 'true',
                            enableCustomDimensionMetric: $stateParams.enableCustomDimensionMetric == 'true',
                            subView: $stateParams.subView == 'true'
                        };
                    },
                    publishers: function () {
                        return null
                    }
                },
                ncyBreadcrumb: {
                    label: 'Report Builder'
                }
            })
            .state('unifiedReport.report.detail', {
                url: '/detail?id&masterReportView&subView&reportViewDataSets&filters&transforms&weightedCalculations&showInTotal&joinBy&name&publisher&formats&fieldTypes&startDate&endDate&preCalculateTable&largeReport&availableToRun&availableToChange&isShowDataSetName&page&limit&searchs&enableCustomDimensionMetric',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'UnifiedReportDetail',
                        templateUrl: 'unifiedReport/report/unifiedReportDetail.tpl.html'
                    }
                },
                resolve: {
                    reportView: function (UnifiedReportViewManager, $stateParams) {
                        if (!!$stateParams.id) {
                            return UnifiedReportViewManager.one($stateParams.id).get()
                                .then(function (reportView) {
                                    if (!!reportView && reportView.subView && angular.isObject(reportView.masterReportView)) {
                                        var masterReportView = angular.copy(reportView.masterReportView);
                                        masterReportView.filters = reportView.filters;
                                        delete  masterReportView.id;
                                        delete  masterReportView.subView;
                                        delete  masterReportView.masterReportView;
                                        delete  masterReportView.name;

                                        reportView = angular.extend(reportView, masterReportView);
                                    }

                                    angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                                        reportViewDataSet.dataSetName = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.name : reportViewDataSet.dataSet;
                                        reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet;
                                    });

                                    reportView.emailSendAlert = reportView.emailSendAlert || [];
                                    reportView.publisher = reportView.publisher.id || reportView.publisher;
                                    reportView.filters = reportView.filters || angular.fromJson($stateParams.filters);
                                    reportView.subView = reportView.subView || $stateParams.subView == 'true';

                                    return reportView;
                                })
                        }

                        return {
                            id: angular.fromJson($stateParams.id),
                            masterReportView: angular.fromJson($stateParams.masterReportView),
                            reportViewDataSets: angular.fromJson($stateParams.reportViewDataSets),
                            fieldTypes: angular.fromJson($stateParams.fieldTypes),
                            transforms: angular.fromJson($stateParams.transforms),
                            showInTotal: angular.fromJson($stateParams.showInTotal),
                            weightedCalculations: angular.fromJson($stateParams.weightedCalculations),
                            formats: angular.fromJson($stateParams.formats),
                            filters: angular.fromJson($stateParams.filters),
                            joinBy: angular.fromJson($stateParams.joinBy) || null,
                            name: $stateParams.name,
                            publisher: $stateParams.publisher,
                            isShowDataSetName: $stateParams.isShowDataSetName == 'true',
                            preCalculateTable: $stateParams.preCalculateTable,
                            largeReport: $stateParams.largeReport == 'true',
                            availableToRun: $stateParams.availableToRun == 'true',
                            availableToChange: $stateParams.availableToChange == 'true',
                            enableCustomDimensionMetric: $stateParams.enableCustomDimensionMetric == 'true',
                            subView: $stateParams.subView == 'true'
                        };
                    },
                    reportGroup: /* @ngInject */ function (unifiedReportBuilder, reportView, $stateParams) {
                        var params = angular.copy(reportView);
                        params.userDefineDimensions = [];
                        params.userDefineMetrics = [];

                        params.startDate = $stateParams.startDate;
                        params.endDate = $stateParams.endDate;

                        // set default page
                        params.page = !$stateParams.page ? 1 : $stateParams.page;
                        params.limit = !$stateParams.limit ? 10 : $stateParams.limit;

                        var joinByMetrics = [];
                        var joinByDimensions = [];

                        if (reportView.enableCustomDimensionMetric) {
                            angular.forEach(reportView.reportViewDataSets, function (reportViewItem) {
                                angular.forEach(reportViewItem.dimensions, function (dimension) {
                                    var indexJoin = _.findIndex(reportView.joinBy, function (join) {
                                        for (var i in join.joinFields) {
                                            var joinField = join.joinFields[i];

                                            if (joinField.field == dimension && joinField.dataSet == reportViewItem.dataSet) {
                                                joinByDimensions.push(join.outputField);
                                                return true
                                            }
                                        }

                                        return false
                                    });

                                    if (indexJoin == -1) {
                                        params.userDefineDimensions.push(dimension + '_' + reportViewItem.dataSet);
                                    }
                                });

                                angular.forEach(reportViewItem.metrics, function (metric) {
                                    var indexJoin = _.findIndex(reportView.joinBy, function (join) {
                                        for (var i in join.joinFields) {
                                            var joinField = join.joinFields[i];

                                            if (joinField.field == metric && joinField.dataSet == reportViewItem.dataSet) {
                                                joinByMetrics.push(join.outputField);
                                                return true
                                            }
                                        }

                                        return false
                                    });

                                    if (indexJoin == -1) {
                                        params.userDefineMetrics.push(metric + '_' + reportViewItem.dataSet);
                                    }
                                });
                            });

                            for (var x in reportView.joinBy) {
                                var join = reportView.joinBy[x];

                                if (join.isVisible) {
                                    if (params.userDefineDimensions.indexOf(join.outputField) == -1 && joinByDimensions.indexOf(join.outputField) > -1) {
                                        params.userDefineDimensions.push(join.outputField);
                                    }

                                    if (params.userDefineMetrics.indexOf(join.outputField) == -1 && joinByMetrics.indexOf(join.outputField) > -1) {
                                        params.userDefineMetrics.push(join.outputField);
                                    }
                                }
                            }

                            angular.forEach(reportView.transforms, function (transform) {
                                if (transform.type == 'addField' || transform.type == 'addConditionValue' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                                    angular.forEach(transform.fields, function (field) {
                                        if (!!field.field) {
                                            params.userDefineMetrics.push(field.field);
                                        }
                                    })
                                }
                            });
                        }

                        return unifiedReportBuilder.getPlatformReport(params);
                    },
                    dataSources: function (reportView, UnifiedReportViewManager) {
                        var listId = [];

                        angular.forEach(reportView.reportViewDataSets, function (item) {
                            listId.push(item.dataSet);
                        });

                        var params = {dataSets: listId.toString()};

                        return UnifiedReportViewManager.one('datasources').getList(null, params);
                    },
                    allDimensionsMetrics: function (reportView, UnifiedReportViewManager) {
                        var listId = [];

                        angular.forEach(reportView.reportViewDataSets, function (item) {
                            listId.push(item.dataSet);
                        });

                        var params = {dataSets: listId.toString()};
                        params.showDataSetName = reportView.isShowDataSetName;

                        return UnifiedReportViewManager.one('datasets').get(params);
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ reportView.name }}'
                }
            })
            .state('unifiedReport.report.listShare', {
                url: '/reportView/{reportViewId:[0-9]+}/listShare?page&sortField&orderBy&searchKey',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ReportViewShareList',
                        templateUrl: 'unifiedReport/report/listShareable.tpl.html'
                    }
                },
                resolve: {
                    listShare: /* @ngInject */ function (UnifiedReportViewManager, $stateParams) {
                        return UnifiedReportViewManager.one($stateParams.reportViewId).one('sharekeyconfigs').getList();
                    },
                    reportView: function (UnifiedReportViewManager, $stateParams) {
                        return UnifiedReportViewManager.one($stateParams.reportViewId).get()
                            .then(function (reportViewClone) {
                                if (!!reportViewClone && reportViewClone.subView && angular.isObject(reportViewClone.masterReportView)) {
                                    var masterReportView = angular.copy(reportViewClone.masterReportView);
                                    masterReportView.filters = reportViewClone.filters;
                                    delete  masterReportView.id;
                                    delete  masterReportView.subView;
                                    delete  masterReportView.masterReportView;
                                    delete  masterReportView.name;

                                    reportViewClone = angular.extend(reportViewClone, masterReportView);
                                }

                                return reportViewClone
                            })
                    },
                    dataSetsFromReportView: function (reportView, unifiedReportBuilder) {
                        return unifiedReportBuilder.getDataSetsFromReportView(reportView)
                    }
                },
                ncyBreadcrumb: {
                    label: 'View Shareable link'
                }
            })
        ;
    }
})();