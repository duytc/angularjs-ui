(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .directive('tcProjectedBillSelector', tcProjectedBillSelector)
    ;

    function tcProjectedBillSelector() {
        return {
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/projectedBill/directives/tcProjectedBillSelector.tpl.html',
            controller: 'ProjectedBillSelector'
        }
    }
})();