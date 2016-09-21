(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .directive('tcVideoReportSelector', tcVideoReportSelector)
    ;

    function tcVideoReportSelector() {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/video/directives/tcVideoReportSelector.tpl.html',
            controller: 'VideoReportSelector'
        }
    }
})();