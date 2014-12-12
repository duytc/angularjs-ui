(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .controller('PerformanceReportSummary', PerformanceReportSummary)
    ;

    function PerformanceReportSummary($scope) {
        $scope.hasSlotOpportunities = hasSlotOpportunities;

        function hasSlotOpportunities() {
            return angular.isObject($scope.reportGroup) && angular.isNumber($scope.reportGroup.slotOpportunities);
        }
    }
})();