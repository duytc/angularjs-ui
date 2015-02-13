(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .directive('tcBillingReportSelector', tcBillingReportSelector)
    ;

    function tcBillingReportSelector() {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/billing/directives/tcBillingReportSelector.tpl.html',
            controller: 'BillingReportSelector'
        }
    }
})();