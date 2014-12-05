(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .directive('tcPerformanceReportSummary', performanceReportSummary)
    ;

    function performanceReportSummary() {
        return {
            scope: {
                report: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportSummary.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();