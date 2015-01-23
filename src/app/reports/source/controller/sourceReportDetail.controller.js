(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .controller('SourceReportDetailController', SourceReportDetailController)
    ;

    function SourceReportDetailController($scope, AlertService, reportGroup, DateFormatter) {
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
                    message: 'There is no report for that selection'
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
            return 'tagcade-source-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate)) + '.csv';
        }
    }
})();