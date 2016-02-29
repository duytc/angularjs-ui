(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .directive('tcRtbReportSelector', tcRtbReportSelector)
    ;

    function tcRtbReportSelector()
    {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/rtb/directives/tcRtbReportSelector.tpl.html',
            controller: 'RtbReportSelector'
        };
    }
})();