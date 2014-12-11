(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .directive('tcBillingReportSummary', tcBillingReportSummary)
    ;

    function tcBillingReportSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/billing/directives/tcBillingReportSummary.tpl.html'
        }
    }
})();