(function () {
    'use strict';

    angular.module('tagcade.public')
        .controller('shareableUnifiedReport', shareableUnifiedReport);

    function shareableUnifiedReport($scope, $translate, reports, unifiedReportFormatReport, AlertService) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.reportView = reports.reportView;
        $scope.hasResult = !angular.isNumber(reports.status);
        $scope.reports = reports.reports || [];
        $scope.total = reports.total;
        $scope.average = reports.average;

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

        $scope.columnPositions = [];
        if (!!$scope.reportView && !!$scope.reportView.formats.length) {
            angular.forEach($scope.reportView.formats, function (format) {
                if (format.type == 'columnPosition') {
                    $scope.columnPositions = format.fields;
                    if ($scope.columnPositions.indexOf('report_view_alias') == -1 && $scope.reportView.multiView) {
                        $scope.columnPositions.unshift('report_view_alias');
                    }
                }
            });
            $scope.columnPositions = _.union($scope.columnPositions, Object.keys($scope.reports[0]));
        }

        if (!$scope.columnPositions.length) {
            $scope.columnPositions = _.keys($scope.titleColumns);
            var indexReportViewAlias = $scope.columnPositions.indexOf('report_view_alias');
            if (indexReportViewAlias > -1 && $scope.reportView.multiView) {
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
            maxPages: 10,
            itemsPerPage: 10
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

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022' + keyname + '\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            $scope.hasSort = true;

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
    }
})
();