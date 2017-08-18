(function () {
    'use strict';

    angular.module('tagcade.public')
        .controller('shareableUnifiedReport', shareableUnifiedReport);

    function shareableUnifiedReport($scope, $stateParams, $translate, exportExcelService, reports, unifiedReportFormatReport, DateFormatter, AlertService, AtSortableService, dataService, API_UNIFIED_PUBLIC_END_POINT, historyStorage, HISTORY_TYPE_PATH) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.reportView = reports.reportView;
        $scope.hasResult = !angular.isNumber(reports.status);
        $scope.reports = reports.reports || [];
        $scope.total = reports.total;
        $scope.average = reports.average;
        $scope.search = {};
        $scope.dimensions = [];
        $scope.metrics = [];

        if(!$scope.hasResult) {
            if(reports.status == 400) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reports.message
                });
            } else if (reports.status == 500){
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

        $scope.tempReports = unifiedReportFormatReport.formatReports($scope.reports, $scope.reportView);

        $scope.titleColumns = reports.columns;
        $scope.columnReportDetailForExportExcel = [];
        $scope.titleReportDetailForExportExcel = [];

        _updateColumnPositions();

        if (!!$scope.reportView.formats.length && !!reports && reports.length > 0) {
            angular.forEach($scope.reportView.formats, function (format) {
                if (format.type == 'columnPosition' && format.fields.length > 0) {
                    angular.forEach(format.fields, function (field) {
                        var index = $scope.columnPositions.indexOf(field);

                        if(index > -1) {
                            $scope.columnPositions.splice(index, 1)
                        }
                    });

                    $scope.columnPositions = format.fields.concat($scope.columnPositions)
                }
            });

            var indexReportViewAlias = $scope.columnPositions.indexOf('report_view_alias');
            if(indexReportViewAlias > -1 && $scope.reportView.multiView) {
                $scope.columnPositions.splice(indexReportViewAlias, 1);
                $scope.columnPositions.unshift('report_view_alias');
            }
        }

        $scope.tableConfig = {
            itemsPerPage: $stateParams.limit || 10,
            maxPages: 10,
            totalItems: reports.totalReport
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getReportDetail;
        var params = {
            page: 1
        };

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.selected = {
            date: {
                startDate: $stateParams.startDate || reports.dateRange.startDate,
                endDate : $stateParams.endDate || reports.dateRange.endDate
            }
        };

        $scope.datePickerOpts = {
            maxDate:  reports.dateRange.endDate,
            minDate:  reports.dateRange.startDate,
            ranges: {
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        _update();

        $scope.getExportExcelFileName = getExportExcelFileName;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isShow = isShow;
        $scope.sort = sort;
        $scope.isNullValue = isNullValue;
        $scope.refreshData = refreshData;
        $scope.searchReportView = searchReportView;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.changePage = changePage;
        $scope.exportExcel = exportExcel;
        $scope.hasFilterDate = hasFilterDate;
        $scope.enableSelectDaterange = enableSelectDaterange;
        $scope.generateReport = generateReport;
        $scope.showPagination = showPagination;

        function generateReport(date) {
            var params = {};
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

            params.startDate = DateFormatter.getFormattedDate(date.startDate);
            params.endDate = DateFormatter.getFormattedDate(date.endDate);
            params.userDefineDimensions = angular.toJson(newDimensions);
            params.userDefineMetrics = angular.toJson(newMetrics);
            $scope.availableOptions.currentPage = 1;

            _getReportDetail(params);
        }

        function hasFilterDate() {
            var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
            for (var reportViewIndex in reportViews) {
                var reportView = reportViews[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.userProvided && !!reports.dateRange.startDate && !!reports.dateRange.endDate) {
                        return true
                    }
                }
            }

            return false;
        }

        function exportExcel() {
            var params = {};
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

            params.startDate = DateFormatter.getFormattedDate($scope.selected.date.startDate);
            params.endDate = DateFormatter.getFormattedDate($scope.selected.date.endDate);
            params.userDefineDimensions = angular.toJson(newDimensions);
            params.userDefineMetrics = angular.toJson(newMetrics);
            params.token = $stateParams.token;
            params.reportView = $stateParams.reportView;

            dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT)
                .then(function (reportData) {
                    exportExcelService.exportExcel(reportData.reports, $scope.columnReportDetailForExportExcel, $scope.titleReportDetailForExportExcel, getExportExcelFileName());
                })
        }

        function changePage(currentPage) {
            _getReportDetail();
        }

        function selectItemPerPages(itemPerPage) {
            _getReportDetail();
        }

        function searchReportView() {
            _getReportDetail();
        }

        function refreshData() {
            historyStorage.getLocationPath(HISTORY_TYPE_PATH.public, 'app.public');
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022' + keyname + '\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            _getReportDetail();
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function isEmptyObject(object) {
            if (!object) {
                return false
            }

            return Object.keys(object).length > 0
        }

        function getExportExcelFileName() {
            return 'report-detail'
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

        function _updateColumnPositions() {
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
                        return join.outputField == col
                    });

                    if(totalDimensions.indexOf(key) > -1 || hasJoin > -1) {
                        dimensions.push(col)
                    } else {
                        metrics.push(col)
                    }
                });

                dimensions = _.sortBy(dimensions, function (dimension) {
                    var key = null;

                    if(dimension.lastIndexOf('_') > -1) {
                        key = dimension.slice(0, dimension.lastIndexOf('_'));
                    } else {
                        key = dimension;
                    }

                    return key
                });

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

                $scope.columnPositions = dimensions.concat(metrics);
                var indexReportViewAlias = $scope.columnPositions.indexOf('report_view_alias');
                if(indexReportViewAlias > -1 && $scope.reportView.multiView) {
                    $scope.columnPositions.splice(indexReportViewAlias, 1);
                    $scope.columnPositions.unshift('report_view_alias');
                }
            }

            if (!!$scope.reportView.formats.length) {
                angular.forEach($scope.reportView.formats, function (format) {
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
                if(indexReportAlias > -1 && $scope.reportView.multiView) {
                    $scope.columnPositions.splice(indexReportAlias, 1);
                    $scope.columnPositions.unshift('report_view_alias');
                }
            }

            if (angular.isArray($scope.reports) && $scope.reports.length > 0) {
                $scope.columnReportDetailForExportExcel = [];
                $scope.titleReportDetailForExportExcel = [];

                $scope.columnPositions = _.intersection($scope.columnPositions, Object.keys($scope.reports[0]));
                var report = $scope.columnPositions;

                angular.forEach(report, function (key) {
                    $scope.columnReportDetailForExportExcel.push(key);

                    var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                    $scope.titleReportDetailForExportExcel.push(title)
                })
            }
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function _getReportDetail(paramsCustom) {
            clearTimeout(getReportDetail);

            if(!!paramsCustom) {
                angular.forEach(angular.copy($scope.search), function (value, key) {
                    if(!paramsCustom.userDefineDimensions[key] && !paramsCustom.userDefineMetrics[key]) {
                        delete $scope.search[key]
                    }
                });
            }

            getReportDetail = setTimeout(function() {
                params = angular.extend(params, $stateParams, {searches: angular.toJson($scope.search), limit: $scope.tableConfig.itemsPerPage, page: $scope.availableOptions.currentPage, orderBy: (!!$scope.reverse ? 'desc': 'acs'), sortField: $scope.sortBy}, paramsCustom);
                return dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT)
                    .then(function(reports) {
                        AtSortableService.insertParamForUrl(params);
                        $scope.reports = reports;
                        $scope.reports = reports.reports || [];
                        $scope.tableConfig.totalItems = reports.totalReport;
                        $scope.availableOptions.currentPage = Number(params.page);

                        _updateColumnPositions();
                    });
            }, 500);
        }

        function _update() {
            var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;

            angular.forEach(reports.fields, function (field) {
                var key = null;

                if(!$scope.reportView.multiView && field.lastIndexOf('_') > -1) {
                    key = field.slice(0, field.lastIndexOf('_'));
                } else {
                    key = field;
                }

                var hasJoin = _.findIndex($scope.reportView.joinBy, function (join) {
                    return join.outputField == field
                });

                angular.forEach(reportViews, function (reportView) {
                    if(reportView.metrics.indexOf(key) > -1) {
                        var index = _.findIndex($scope.metrics, {name: field});

                        if(index == -1) {
                            $scope.metrics.push({name: field, label: $scope.titleColumns[field], ticked: true});
                        }
                    }

                    if(reportView.dimensions.indexOf(key) > -1 || hasJoin > -1 || key == 'report_view_alias') {
                        var j = _.findIndex($scope.dimensions, {name: field});

                        if(j == -1) {
                            $scope.dimensions.push({name: field, label: $scope.titleColumns[field], ticked: true});
                        }
                    }
                });

                if(_.findIndex($scope.dimensions, {name: field}) == -1 && _.findIndex($scope.metrics, {name: field}) == -1) {
                    $scope.metrics.push({name: field, label: $scope.titleColumns[field], ticked: true});
                }
            });

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
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.public)
        });
    }
})
();