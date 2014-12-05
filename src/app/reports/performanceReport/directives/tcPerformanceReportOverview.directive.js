(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .directive('tcPerformanceReportOverview', performanceReportOverview)
    ;

    function performanceReportOverview() {
        return {
            scope: {
                report: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportOverview.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();