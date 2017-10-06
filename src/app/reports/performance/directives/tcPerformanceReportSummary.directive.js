(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .directive('tcPerformanceReportSummary', tcPerformanceReportSummary)
    ;

    function tcPerformanceReportSummary() {
        return {
            scope: {
                reportGroup: '=',
                showRefreshedSlotOpportunities: '=',
                showRefreshes: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performance/directives/tcPerformanceReportSummary.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();