(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, $state, _, AlertService, ReportParams, reportGroup, $filter, DateFormatter) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.exportExcel = exportExcel;
        $scope.getExportExcelFileName = getExportExcelFileName();

        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.drillDownReport = drillDownReport;

        if (!reportGroup) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There are no reports for that selection'
            });
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function drillDownReport(relativeToState, report) {
            if (!angular.isString(relativeToState)) {
                return;
            }

            relativeToState = $state.get(relativeToState, $state.$current);

            if (!relativeToState) {
                console.log('relative report state does not exist');
                return;
            }

            var unfilteredParams = {};

            if (_.isObject(reportGroup.reportType)) {
                _.extend(unfilteredParams, reportGroup.reportType);
            }

            _.extend(unfilteredParams, report);

            var params = ReportParams.getStateParams(unfilteredParams);

            $state.transitionTo(relativeToState, params)
                .catch(function() {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });
                })
            ;
        }

        function exportExcel() {
            var exportExcel = $scope.reports;
            angular.forEach(exportExcel, function(value) {
                delete value.averageTotalOpportunities;
                delete value.averagePassbacks;
                delete value.averageImpressions;
                delete value.averageFillRate;
                delete value.averageEstRevenue;
                delete value.averageEstCpm;
                delete value.averageSlotOpportunities;
                delete value.averageBilledAmount;
                delete value.reports;
                delete value.reportType;
                delete value.$$hashKey;
                delete value.adNetworkId;
                delete value.billedAmount;
                delete value.billedRate;
                delete value.publisherId;
                delete value.siteId;

                value.date = $filter('date')(value.date, 'longDate');
                value.endDate = $filter('date')(value.endDate, 'longDate');
                value.startDate = $filter('date')(value.startDate, 'longDate');
            });

            return exportExcel;
        }

        function getExportExcelFileName() {
            return 'tagcade-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate)) + '.csv';
        }
    }
})();