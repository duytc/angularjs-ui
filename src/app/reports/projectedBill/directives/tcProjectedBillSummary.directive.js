(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .directive('tcProjectedBillSummary', tcProjectedBillSummary)
    ;

    function tcProjectedBillSummary() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/projectedBill/directives/tcProjectedBillSummary.tpl.html'
        }
    }
})();