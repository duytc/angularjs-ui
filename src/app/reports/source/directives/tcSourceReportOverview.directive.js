(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .directive('tcSourceReportOverview', tcSourceReportOverview)
    ;

    function tcSourceReportOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/source/directives/tcSourceReportOverview.tpl.html'
        }
    }
})();