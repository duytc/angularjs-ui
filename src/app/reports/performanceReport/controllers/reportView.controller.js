(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .controller('ReportView', ReportView)
    ;

    /**
     *
     * @param $scope
     * @param report
     * @param {Array} report.reports
     * @constructor
     */
    function ReportView($scope, report) {
        $scope.report = report;
        $scope.dailyReports = report.reports;
        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;

        function showPagination() {
            return $scope.dailyReports.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();