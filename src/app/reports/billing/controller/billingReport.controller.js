(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReport', BillingReport)
    ;

    function BillingReport($scope, _, AlertService, billingService, reportGroup) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        var initialParams = billingService.getInitialParams();

        $scope.initialSelectorData = {
            date: {
                startDate: initialParams.startDate,
                endDate: initialParams.endDate
            },
            publisherId: initialParams.publisherId
        };

        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;

        init();

        function init() {
            if (!$scope.hasResult) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: 'There are no reports for that selection'
                });
            }
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();