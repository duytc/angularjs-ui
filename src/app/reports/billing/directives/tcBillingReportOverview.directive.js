(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .directive('tcBillingReportOverview', tcBillingReportOverview)
    ;

    function tcBillingReportOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/billing/directives/tcBillingReportOverview.tpl.html'
        }
    }
})();