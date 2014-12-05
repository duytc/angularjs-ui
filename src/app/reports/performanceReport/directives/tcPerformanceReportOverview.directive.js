(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .directive('tcPerformanceReportOverview', performanceReportOverview)
    ;

    function performanceReportOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportOverview.tpl.html',
            controller: 'PerformanceReportSummary'
        }
    }
})();