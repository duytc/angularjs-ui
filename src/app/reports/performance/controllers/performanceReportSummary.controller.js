(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSummary', PerformanceReportSummary)
    ;

    function PerformanceReportSummary($scope, Auth) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.hasSlotOpportunities = hasSlotOpportunities;
        $scope.showItem = showItem;

        function hasSlotOpportunities() {
            return angular.isObject($scope.reportGroup) && angular.isNumber($scope.reportGroup.slotOpportunities);
        }

        function showItem() {
            return angular.isNumber($scope.reportGroup.clicks);
        }
    }
})();