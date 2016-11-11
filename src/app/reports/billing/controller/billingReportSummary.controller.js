(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReportSummary', BillingReportSummary)
    ;

    function BillingReportSummary($scope, $stateParams) {
        $scope.product = $stateParams.product;
    }
})();