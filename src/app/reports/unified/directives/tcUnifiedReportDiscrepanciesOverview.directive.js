(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .directive('tcUnifiedReportDiscrepanciesOverview', tcUnifiedReportDiscrepanciesOverview)
    ;

    function tcUnifiedReportDiscrepanciesOverview() {
        return {
            scope: {
                reportGroup: '=',
                tagcade: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/unified/directives/tcUnifiedReportDiscrepanciesOverview.tpl.html',
            controller: 'UnifiedReportSummary'
        }
    }
})();