(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .directive('tcRtbReportOverview', tcRtbReportOverview)
    ;

    function tcRtbReportOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/rtb/directives/tcRtbReportOverview.tpl.html',
            controller: 'RtbReportSummary'
        }
    }
})();