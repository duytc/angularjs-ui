(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReport', BillingReport)
    ;

    function BillingReport($scope, $state, $translate, $stateParams, AlertService, reportGroup, DateFormatter, performanceReportHelper, PERFORMANCE_REPORT_STATES, HEADER_BIDDING_REPORT_STATES) {
        $scope.hasResult = reportGroup !== false;
        $scope.product = $stateParams.product;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.reportStates = PERFORMANCE_REPORT_STATES;
        $scope.hbReportStates = HEADER_BIDDING_REPORT_STATES;

        $scope.drillDownReport = drillDownReport;
        $scope.drillDownForVideo = drillDownForVideo;

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
            report.product = $scope.product;

            performanceReportHelper.drillDownReport(relativeToState, report, reportGroup);
        }

        function drillDownForVideo(params) {
            params = angular.extend($stateParams, params);

            $state.transitionTo(
                $state.$current,
                params, {reload: true}
            );
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            return 'tagcade-billing-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();