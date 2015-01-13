(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .directive('tcSourceReportSummary', tcSourceReportSummary)
    ;

    function tcSourceReportSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/source/directives/tcSourceReportSummary.tpl.html'
        }
    }
})();