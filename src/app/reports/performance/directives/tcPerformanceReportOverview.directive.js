(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .directive('tcPerformanceReportOverview', tcPerformanceReportOverview)
    ;

    function tcPerformanceReportOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performance/directives/tcPerformanceReportOverview.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();