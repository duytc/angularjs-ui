(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .directive('tcUnifiedReportSelector', tcUnifiedReportSelector)
    ;

    function tcUnifiedReportSelector() {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/unified/directives/tcUnifiedReportSelector.tpl.html',
            controller: 'UnifiedReportSelector'
        }
    }
})();