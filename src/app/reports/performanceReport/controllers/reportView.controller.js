(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, AlertService, reportGroup) {
        if (!reportGroup) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There are no reports for that selection'
            });
        }

        $scope.hasResult = reportGroup !== false;

        $scope.reportGroup = reportGroup || {};
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();