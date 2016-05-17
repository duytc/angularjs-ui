(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSummary', PerformanceReportSummary)
    ;

    function PerformanceReportSummary($scope, Auth, TYPE_AD_SLOT, USER_MODULES) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.hasSlotOpportunities = hasSlotOpportunities;
        $scope.exist = exist;
        $scope.hideRTB = hideRTB;

        function hasSlotOpportunities() {
            return angular.isObject($scope.reportGroup) && angular.isNumber($scope.reportGroup.slotOpportunities);
        }

        if(!!$scope.reportGroup) {
            var isNotNativeAdSlot = $scope.reportGroup.reportType && $scope.reportGroup.reportType.adSlotType != TYPE_AD_SLOT.native ? true : false;
        }

        function exist(item) {
            if(item == undefined || !isNotNativeAdSlot) {
                return false;
            }

            return true;
        }

        function hideRTB() {
            if(!Auth.getSession().hasModuleEnabled(USER_MODULES.rtb) || $scope.reportGroup.rtbImpressions == undefined) {
                return false;
            }

            return true;
        }
    }
})();