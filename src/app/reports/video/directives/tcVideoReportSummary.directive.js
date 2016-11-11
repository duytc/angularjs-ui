(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .directive('tcVideoReportSummary', tcVideoReportSummary)
    ;

    function tcVideoReportSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/video/directives/tcVideoReportSummary.tpl.html',
            controller: 'VideoReportSummary'
        }
    }
})();