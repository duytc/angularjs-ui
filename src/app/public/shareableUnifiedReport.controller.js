(function () {
    'use strict';

    angular.module('tagcade.public')
        .controller('shareableUnifiedReport', shareableUnifiedReport);

    function shareableUnifiedReport($scope, $stateParams, $translate, reports, unifiedReportFormatReport, AlertService, AtSortableService, dataService, API_UNIFIED_PUBLIC_END_POINT, historyStorage, HISTORY_TYPE_PATH) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.reportView = reports.reportView;
        $scope.hasResult = !angular.isNumber(reports.status);
        $scope.reports = reports.reports || [];
        $scope.total = reports.total;
        $scope.average = reports.average;
        $scope.search = {};

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

        if (!!$scope.reportView.formats.length) {
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

        if (angular.isArray($scope.reports) && $scope.reports.length > 0) {
            $scope.columnPositions = _.intersection($scope.columnPositions, Object.keys($scope.reports[0]));
            var report = $scope.columnPositions;

            angular.forEach(report, function (key) {
                $scope.columnReportDetailForExportExcel.push(key);

                var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                $scope.titleReportDetailForExportExcel.push(title)
            })
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
        
        $scope.getExportExcelFileName = getExportExcelFileName;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isShow = isShow;
        $scope.sort = sort;
        $scope.isNullValue = isNullValue;
        $scope.refreshData = refreshData;
        $scope.searchReportView = searchReportView;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.changePage = changePage;

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

        function _updateColumnPositions() {
            $scope.columnPositions = [];

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
        }

        function _getReportDetail() {
            clearTimeout(getReportDetail);

            getReportDetail = setTimeout(function() {
                params = angular.extend(params, $stateParams, {searches: angular.toJson($scope.search), limit: $scope.tableConfig.itemsPerPage, page: $scope.availableOptions.currentPage, orderBy: (!!$scope.reverse ? 'desc': 'acs'), sortField: $scope.sortBy});
                return dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT)
                    .then(function(reports) {
                        AtSortableService.insertParamForUrl(params);
                        $scope.reports = reports;
                        $scope.reports = reports.reports || [];
                        $scope.tableConfig.totalItems = reports.totalReport;
                        $scope.availableOptions.currentPage = Number(params.page);
                    });
            }, 500);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.public)
        });
    }
})
();