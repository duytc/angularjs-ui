(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .directive('tcPerformanceReportSelector', tcPerformanceReportSelector)
    ;

    function tcPerformanceReportSelector()
    {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performance/directives/tcPerformanceReportSelector.tpl.html',
            controller: 'PerformanceReportSelector'
        };
    }
})();