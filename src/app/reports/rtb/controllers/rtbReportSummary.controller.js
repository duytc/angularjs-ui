(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .controller('RtbReportSummary', RtbReportSummary)
    ;

    function RtbReportSummary($scope, Auth, TYPE_AD_SLOT) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.exist = exist;

        if(!!$scope.reportGroup) {
            var isNotNativeAdSlot = $scope.reportGroup.reportType && $scope.reportGroup.reportType.adSlotType != TYPE_AD_SLOT.native ? true : false;
        }

        function exist(item) {
            if(item == undefined || !isNotNativeAdSlot) {
                return false;
            }

            return true;
        }
    }
})();