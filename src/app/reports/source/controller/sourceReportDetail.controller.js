(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .controller('SourceReportDetailController', SourceReportDetailController)
    ;

    function SourceReportDetailController($scope, $translate, AlertService, reportGroup, DateFormatter) {
        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;

        var report = null;

        if (angular.isArray(reportGroup.reports)) {
            report = reportGroup.reports[0]
        }

        $scope.hasResult = angular.isObject(report);
        $scope.report = report;

        $scope.query = {};
        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.getExportExcelFileName = getExportExcelFileName();

        var reportViews = {
            'user': false,
            'display': false,
            'video': false
        };

        $scope.reportViews = angular.copy(reportViews);
        $scope.reportViews.user = true;

        $scope.showView = showView;

        init();

        function init() {
            if (!$scope.hasResult) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('SOURCE_REPORT_MODULE.NO_REPORT_FOR_SELECTION')
                });
            }
        }

        function showView(view) {
            if (reportViews.hasOwnProperty(view)) {
                $scope.reportViews = angular.copy(reportViews); // reset all views to false
                $scope.reportViews[view] = true;
            }
        }

        function showPagination() {
            return angular.isArray(report.records) && report.records.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            return 'pubvantage-source-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();