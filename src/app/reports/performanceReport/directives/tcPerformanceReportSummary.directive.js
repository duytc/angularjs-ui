(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .directive('tcPerformanceReportSummary', performanceReportSummary)
    ;

    function performanceReportSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportSummary.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();