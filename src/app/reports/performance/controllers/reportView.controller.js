(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, $state, Auth, AlertService, reportGroup, DateFormatter, performanceReportHelper, PERFORMANCE_REPORT_STATES, UPDATE_CPM_TYPES) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $state.current.params.expanded ? (reportGroup.expandedReports || []) : ($scope.reportGroup.reports || []);

        $scope.getExportExcelFileName = getExportExcelFileName();

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.params = $state.current.params;
        $scope.reportStates = PERFORMANCE_REPORT_STATES;
        $scope.updateCpmTypes = UPDATE_CPM_TYPES;

        $scope.goToEditPage = goToEditPage;
        $scope.popupReport = popupReport;
        $scope.drillDownReport = drillDownReport;
        $scope.openUpdateCpm = openUpdateCpm;

        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There are no reports for that selection'
            });
        }

        function popupReport(relativeToState, report) {
            performanceReportHelper.popupReport(relativeToState, report, reportGroup);
        }

        function drillDownReport(relativeToState, report) {
            performanceReportHelper.drillDownReport(relativeToState, report, reportGroup);
        }

        function openUpdateCpm(item, type) {
            performanceReportHelper.openUpdateCpm(item, type, reportGroup);
        }

        function goToEditPage(baseState, id) {
            performanceReportHelper.goToEditPage(baseState, id);
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            var reportType = reportGroup.reportType || {};
            var reportTypeString =  angular.isArray(reportType) ? (reportType.shift().reportType): reportType.reportType;

            reportTypeString = (reportTypeString != null && reportTypeString != undefined) ? reportTypeString.replace(/\./g, "-") : '';

            return 'tagcade-report-' + reportTypeString + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();