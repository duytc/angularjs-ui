(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .directive('tcUnifiedReportOverview', tcUnifiedReportOverview)
    ;

    function tcUnifiedReportOverview() {
        return {
            scope: {
                reportGroup: '=',
                tagcade: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/unified/directives/tcUnifiedReportOverview.tpl.html',
            controller: 'UnifiedReportSummary'
        }
    }
})();