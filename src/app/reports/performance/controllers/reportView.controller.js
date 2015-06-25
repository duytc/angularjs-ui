(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, sessionStorage, $state, Auth, AlertService, reportGroup, DateFormatter, performanceReportHelper, PERFORMANCE_REPORT_STATES, UPDATE_CPM_TYPES, TYPE_AD_SLOT_FOR_LIST) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $state.current.params.expanded ? ($scope.reportGroup.expandedReports || []) : ($scope.reportGroup.reports || []);

        if(!!$scope.reportGroup) {
            $scope.isNativeAdSlot = $scope.reportGroup.reportType && $scope.reportGroup.reportType.adSlotType != TYPE_AD_SLOT_FOR_LIST.native ? true : false;
        }

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
        $scope.backToAdTagList = backToAdTagList;

        $scope.showConfigForPerformanceByAdTag = showConfigForPerformanceByAdTag;

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

        var settings = isAdmin ? [] : angular.fromJson(sessionStorage.getCurrentSettings());
        function showConfigForPerformanceByAdTag(setting) {
            var report = 'performance';
            var reportType = 'adTag';

            if (isAdmin
                || !settings
                || !settings.view
                || !settings.view.report
                || !settings.view.report[report]
                || !settings.view.report[report][reportType]
                || !settings.view.report[report][reportType][setting]) {
                return true;
            }

            return !!settings.view.report[report][reportType][setting].show;
        };

        function backToAdTagList() {
            var state = !!$scope.isNativeAdSlot ? '^.^.^.tagManagement.adTag.list' : '^.^.^.tagManagement.adTag.nativeList';

            $state.go(state, {adSlotId: $scope.reportGroup.reportType.adSlotId})
        }
    }
})();