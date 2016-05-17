(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .directive('tcRtbReportSummary', tcRtbReportSummary)
    ;

    function tcRtbReportSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/rtb/directives/tcRtbReportSummary.tpl.html',
            controller: 'RtbReportSummary'
        }
    }
})();