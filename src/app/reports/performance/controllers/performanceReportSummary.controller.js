(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSummary', PerformanceReportSummary)
    ;

    function PerformanceReportSummary($scope, Auth) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.hasSlotOpportunities = hasSlotOpportunities;
        $scope.exist = exist;

        function hasSlotOpportunities() {
            return angular.isObject($scope.reportGroup) && angular.isNumber($scope.reportGroup.slotOpportunities);
        }

        function exist(item) {
            if(item == undefined) {
                return false;
            }

            return true;
        }
    }
})();