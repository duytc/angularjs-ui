(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportDetail', UnifiedReportDetail);

    function UnifiedReportDetail($scope, $q, $modal, historyStorage, $stateParams, _, reportView, $translate, reportGroup, dataService, unifiedReportBuilder, getDateReportView, AlertService, UnifiedReportViewManager, DateFormatter, HISTORY_TYPE_PATH, API_UNIFIED_END_POINT) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.tableConfig = {
            itemsPerPage: $stateParams.limit || 10,
            maxPages: 10,
            totalItems: reportGroup.totalReport
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getReportDetail;
        var params = {
            page: 1
        };

        $scope.search = {};
        $scope.reportView = reportView;
        $scope.reportGroup = reportGroup;
        $scope.hasResult = !angular.isNumber(reportGroup.status);

        $scope.reports = reportGroup.reports || [];
        $scope.types = reportGroup.types;
        $scope.isNew = !$scope.reportView.id;
        $scope.hasSaveRepoerView = !!$stateParams.reportView;
        $scope.formProcessing = false;

        $scope.dimensions = [];
        $scope.metrics = [];

        // user tempReports to orderBy and reports to view
        // $scope.tempReports = unifiedReportFormatReport.formatReports($scope.reports, $scope.reportView);

        _updateColumnPositions();

        $scope.reportViewForEdit = {
            reportViewDataSets: angular.toJson(reportView.reportViewDataSets),
            reportViewMultiViews: angular.toJson(reportView.reportViewMultiViews),
            filter: angular.toJson(reportView.filter),
            transforms: angular.toJson(reportView.transforms),
            showInTotal: angular.toJson(reportView.showInTotal),
            formats: angular.toJson(reportView.formats),
            weightedCalculations: angular.toJson(reportView.weightedCalculations),
            joinBy: angular.toJson(reportView.joinBy),
            name: reportView.name,
            alias: reportView.alias,
            reportView: reportView.id,
            multiView: reportView.multiView,
            subReportsIncluded: reportView.subReportsIncluded,
            isShowDataSetName: reportView.isShowDataSetName,
            enableCustomDimensionMetric: reportView.enableCustomDimensionMetric,
            publisher: angular.isObject(reportView.publisher) ? reportView.publisher.id : reportView.publisher
        };

        if(!$scope.hasResult) {
            if(reportGroup.status == 400) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reportGroup.message
                });
            } else if (reportGroup.status == 500){
                AlertService.replaceAlerts({
                    type: 'error',
                    message:  $translate.instant('REPORT.REPORT_FAIL')
                });
            } else {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }
        } else {
            if ($scope.reports.length == 0) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }
        }

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.itemsPerPage.selected = $scope.tableConfig.itemsPerPage;

        $scope.selected = {
            date: {
                startDate: $stateParams.startDate || getDateReportView.getMinStartDateInFilterReportView(reportView),
                endDate : $stateParams.endDate || getDateReportView.getMaxEndDateInFilterReportView(reportView)
            }
        };

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.showPagination = showPagination;
        $scope.showItemPerPage = showItemPerPage;
        $scope.saveReportView = saveReportView;
        $scope.getExportExcelFileName = getExportExcelFileName;

        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isNullValue = isNullValue;
        
        $scope.generateReport = generateReport;
        $scope.hasFilterDate = hasFilterDate;
        $scope.hideDaterange = hideDaterange;
        $scope.enableSelectDaterange = enableSelectDaterange;
        $scope.refreshData = refreshData;
        $scope.changePage = changePage;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.searchReportView = searchReportView;
        $scope.exportExcel = exportExcel;

        function exportExcel() {
            var params = _toJsonReportView(reportView);
            delete params.page;

            dataService.makeHttpPOSTRequest('', params, API_UNIFIED_END_POINT + '/v1/reportview/download')
                .then(function (data) {
                    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
                    var reportName = !!reportView.name ? reportView.name : 'report-detail';

                    return saveAs(blob, [reportName + '.csv']);
                });
        }
        
        function searchReportView() {
            _getReportDetail(_toJsonReportView(reportView), 250);
        }
        
        function selectItemPerPages(itemPerPage) {
            _getReportDetail(_toJsonReportView(reportView, itemPerPage));
        }

        function changePage(currentPage) {
            _getReportDetail(_toJsonReportView(reportView));
        }

        function _getReportDetail(query, timeout) {
            clearTimeout(getReportDetail);

            getReportDetail = setTimeout(function() {
                params = angular.copy(query);
                return unifiedReportBuilder.getPlatformReport(params)
                    .then(function(reportGroup) {
                        $scope.reportGroup = reportGroup;
                        $scope.reports = reportGroup.reports || [];
                        $scope.tableConfig.totalItems = reportGroup.totalReport;
                        $scope.availableOptions.currentPage = Number(params.page);

                        _updateColumnPositions();
                    });
            }, timeout || 0);
        }

        function refreshData() {
            historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportDetail, '^.detail');
        }

        function enableSelectDaterange() {
            if(!!$scope.reportView.enableCustomDimensionMetric) {
                return true
            }

            var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
            for (var reportViewIndex in reportViews) {
                var reportView = reportViews[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if(filter.type == 'date' || filter.type == 'datetime') {
                        if(filter.userProvided) {
                            return true
                        }
                    }
                }
            }

            return false;
        }

        function hideDaterange() {
            var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
            for (var reportViewIndex in reportViews) {
                var reportView = reportViews[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if(filter.type == 'date' || filter.type == 'datetime') {
                        return true
                    }
                }
            }

            return false;
        }

        function hasFilterDate() {
            var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
            for (var reportViewIndex in reportViews) {
                var reportView = reportViews[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.dateType == 'userProvided') {
                        return true
                    }
                }
            }

            return false;
        }

        function generateReport(date) {
            var params = _toJsonReportView(reportView);

            params.startDate = DateFormatter.getFormattedDate(date.startDate);
            params.endDate = DateFormatter.getFormattedDate(date.endDate);

            _getReportDetail(params);
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        function isEmptyObject(object) {
            if (!object) {
                return false
            }

            return Object.keys(object).length > 0
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022'+keyname+'\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            _getReportDetail(_toJsonReportView(reportView));
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function getExportExcelFileName() {
            return !!$scope.reportView.name ? $scope.reportView.name : 'report-detail';
        }

        function saveReportView() {
            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                    $scope.hasSaveRepoerView = true;
                    $scope.formProcessing = true;

                    if (!$scope.isAdmin()) {
                        delete $scope.reportView.publisher;
                    }

                    var save = !$scope.isNew ? UnifiedReportViewManager.one($scope.reportView.id).patch($scope.reportView) : UnifiedReportViewManager.post($scope.reportView);

                    save.then(function (data) {
                        if ($scope.isNew) {
                            $scope.reportView.id = data.id;
                            $scope.reportViewForEdit.reportView = data.id;
                        }

                        $scope.formProcessing = false;

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $scope.isNew ? 'The report view has been created' : 'The report view has been updated'
                        });
                    })
                    .catch(function () {
                        $scope.hasSaveRepoerView = false;
                    });
                });

            if (!$scope.reportView.name) {
                var modalInstance = $modal.open({
                    templateUrl: 'unifiedReport/report/inputName.tpl.html',
                    resolve: {
                        reportView: function () {
                            return $scope.reportView
                        }
                    },
                    controller: function ($scope, reportView) {
                        $scope.reportView = reportView;
                    }
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                }).catch(function () {
                    $scope.reportView.name = null;
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }

        function showPagination() {
            if(!showItemPerPage()) {
                return false
            }

            return angular.isArray($scope.reportGroup.reports) && $scope.reportGroup.totalReport > $scope.tableConfig.itemsPerPage;
        }

        function showItemPerPage() {
            // var numFalse = 0;
            // var numField = 0;
            // for (var field in $scope.fieldsShow) {
            //     numField += 1;
            //
            //     if(!$scope.fieldsShow[field]) {
            //         numFalse += 1;
            //     }
            // }
            //
            // if(numFalse == numField) {
            //     return false
            // }

            return true;
        }

        function _toJsonReportView(reportView, itemPerPage) {
            var params = angular.copy(reportView);

            params.startDate = DateFormatter.getFormattedDate($scope.selected.date.startDate);
            params.endDate = DateFormatter.getFormattedDate($scope.selected.date.endDate);

            var newDimensions = [];
            var newMetrics = [];

            angular.forEach($scope.fieldsShow.dimensions, function (value) {
                if(value && value.ticked && !!$scope.dimensions) {
                    newDimensions.push(value.name);
                }
            });

            angular.forEach($scope.fieldsShow.metrics, function (value) {
                if(value && value.ticked && !!$scope.metrics) {
                    newMetrics.push(value.name);
                }
            });

            params = angular.extend(params, {
                searches: $scope.search,
                limit: !!itemPerPage ? itemPerPage.key : $scope.tableConfig.itemsPerPage,
                page: $scope.availableOptions.currentPage,
                orderBy: (!!$scope.reverse ? 'desc': 'acs'),
                sortField: $scope.sortBy,
                userDefineDimensions: newDimensions,
                userDefineMetrics: newMetrics,
                needToGroup: !!$scope.dimensions && newDimensions.length != $scope.dimensions.length
            });

            return params;
        }

        function _updateColumnPositions() {
            $scope.titleColumnsForSelect = !!$scope.titleColumns && Object.keys($scope.titleColumnsForSelect).length > 0 ? $scope.titleColumnsForSelect : $scope.reportGroup.columns;
            $scope.titleColumns = $scope.reportGroup.columns;
            $scope.columnReportDetailForExportExcel = [];
            $scope.titleReportDetailForExportExcel = [];

            $scope.columnPositions = !!$scope.columnPositions && $scope.columnPositions.length > 0 ? $scope.columnPositions : [];

            if ($scope.reports.length > 0) {
                var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
                var totalDimensions = [];
                var totalMetrics = [];
                
                angular.forEach(reportViews, function (reportView) {
                    totalDimensions = totalDimensions.concat(reportView.dimensions);
                    totalMetrics = totalMetrics.concat(reportView.metrics)
                });
                
                var dimensions = [];
                var metrics = [];

                angular.forEach(_.keys($scope.reports[0]), function (col) {
                    var key = null;

                    if(!$scope.reportView.multiView && col.lastIndexOf('_') > -1) {
                        key = col.slice(0, col.lastIndexOf('_'));
                    } else {
                        key = col;
                    }

                    var hasJoin = _.findIndex($scope.reportView.joinBy, function (join) {
                            return join.outputField == key
                    });

                    if(totalDimensions.indexOf(key) > -1 || hasJoin > -1) {
                        dimensions.push(col);

                        if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == col }) == -1) {
                            $scope.dimensions.push({name: col, label: $scope.titleColumnsForSelect[col], ticked: true});
                        }
                    } else {
                        metrics.push(col);

                        if(_.findIndex($scope.metrics, function (dimension) { return dimension.name == col }) == -1) {
                            $scope.metrics.push({name: col, label: $scope.titleColumnsForSelect[col], ticked: true});
                        }
                    }
                });

                dimensions = _.sortBy(dimensions);
                dimensions = _.sortBy(dimensions, function (dimension) {
                    var key = null;

                    if(dimension.lastIndexOf('_') > -1) {
                        key = dimension.slice(0, dimension.lastIndexOf('_'));
                    } else {
                        key = dimension;
                    }

                    return key
                });

                metrics = _.sortBy(metrics);
                metrics = _.sortBy(metrics, function (metric) {
                    var key = null;

                    if(metric.lastIndexOf('_') > -1) {
                        key = metric.slice(0, metric.lastIndexOf('_'));
                    } else {
                        key = metric;
                    }

                    return key
                });

                angular.forEach(angular.copy(dimensions).reverse(), function (dimension) {
                    if($scope.reportView.fieldTypes[dimension] == 'date' || $scope.reportView.fieldTypes[dimension] == 'datetime') {
                        dimensions.splice(dimensions.indexOf(dimension), 1);
                        dimensions.unshift(dimension);
                    }
                });

                angular.forEach(angular.copy(metrics).reverse(), function (metric) {
                    if($scope.reportView.fieldTypes[metric] == 'date' || $scope.reportView.fieldTypes[metric] == 'datetime') {
                        metrics.splice(metrics.indexOf(metric), 1);
                        metrics.unshift(metric);
                    }
                });

                $scope.columnPositions = dimensions.concat(metrics);
                var indexReportViewAlias = $scope.columnPositions.indexOf('report_view_alias');
                if(indexReportViewAlias > -1 && reportView.multiView) {
                    $scope.columnPositions.splice(indexReportViewAlias, 1);
                    $scope.columnPositions.unshift('report_view_alias');
                }
            }

            if (!!reportView.formats.length) {
                angular.forEach(reportView.formats, function (format) {
                    if (format.type == 'columnPosition' && format.fields.length > 0) {
                        angular.forEach(format.fields, function (field) {
                            var index = $scope.columnPositions.indexOf(field);

                            if(index > -1) {
                                $scope.columnPositions.splice(index, 1)
                            }
                        });

                        $scope.columnPositions = format.fields.concat($scope.columnPositions);
                        
                        angular.forEach(angular.copy($scope.columnPositions), function (col) {
                            var index = $scope.columnPositions.indexOf(col);
                            if(!!$scope.titleColumns && !$scope.titleColumns[col] && index > -1) {
                                $scope.columnPositions.splice(index, 1);
                            }
                        })
                    }
                });

                var indexReportAlias = $scope.columnPositions.indexOf('report_view_alias');
                if(indexReportAlias > -1 && reportView.multiView) {
                    $scope.columnPositions.splice(indexReportAlias, 1);
                    $scope.columnPositions.unshift('report_view_alias');
                }
            }

            if (angular.isArray($scope.reports) && $scope.reports.length > 0) {
                $scope.columnReportDetailForExportExcel = $scope.columnPositions;

                angular.forEach($scope.columnPositions, function (key) {
                    var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                    $scope.titleReportDetailForExportExcel.push(title)
                })
            }

            $scope.fieldsShow = $scope.fieldsShow || {dimensions: [], metrics: []};
        }

        $scope.$watch(function () {
            return $scope.fieldsShow.dimensions
        }, function () {
            var totalSelect = 0;
            var indexDimension;

            angular.forEach($scope.dimensions, function (dimension, index) {
                if(dimension.ticked) {
                    totalSelect += 1;
                    indexDimension = index;

                    dimension.disabled = false;
                }
            });

            if(totalSelect == 1) {
                $scope.dimensions[indexDimension].disabled = true
            }
        });

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.unifiedReportDetail)
        });
    }
})();