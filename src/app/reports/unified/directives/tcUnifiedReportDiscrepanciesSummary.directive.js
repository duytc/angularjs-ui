(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .directive('tcUnifiedReportDiscrepanciesSummary', tcUnifiedReportDiscrepanciesSummary)
    ;

    function tcUnifiedReportDiscrepanciesSummary() {
        return {
            scope: {
                reportGroup: '=',
                tagcade: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/unified/directives/tcUnifiedReportDiscrepanciesSummary.tpl.html',
            controller: 'UnifiedReportSummary'
        }
    }
})();