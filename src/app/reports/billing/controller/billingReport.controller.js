(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReport', BillingReport)
    ;

    function BillingReport($scope, $translate, AlertService, reportGroup, DateFormatter, performanceReportHelper, PERFORMANCE_REPORT_STATES) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.drillDownReport = drillDownReport;
        $scope.reportStates = PERFORMANCE_REPORT_STATES;

        $scope.showPagination = showPagination;
        $scope.getExportExcelFileName = getExportExcelFileName();

        init();

        function init() {
            if (!$scope.hasResult) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }
        }

        function drillDownReport(relativeToState, report) {
            performanceReportHelper.drillDownReport(relativeToState, report, reportGroup);
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            return 'tagcade-billing-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();