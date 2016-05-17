(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .directive('tcUnifiedReportSummary', tcUnifiedReportSummary)
    ;

    function tcUnifiedReportSummary() {
        return {
            scope: {
                reportGroup: '=',
                tagcade: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/unified/directives/tcUnifiedReportSummary.tpl.html',
            controller: 'UnifiedReportSummary'
        }
    }
})();