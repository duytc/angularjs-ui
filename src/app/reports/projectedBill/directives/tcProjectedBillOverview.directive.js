(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .directive('tcProjectedBillOverview', tcProjectedBillOverview)
    ;

    function tcProjectedBillOverview() {
        return {
            scope: {
                reportGroup: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/projectedBill/directives/tcProjectedBillOverview.tpl.html'
        }
    }
})();