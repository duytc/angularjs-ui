(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .directive('tcPerformanceReportSelector', performanceReportSelector)
    ;

    function performanceReportSelector()
    {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportSelector.tpl.html',
            controller: 'PerformanceReportSelector'
        };
    }
})();