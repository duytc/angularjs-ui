(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('popupReportController', popupReportController)
    ;

    function popupReportController($scope, reportGroup, relativeEntityData, Auth, performanceReportHelper, UPDATE_CPM_TYPES) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.relativeEntityData = relativeEntityData;

        $scope.updateCpmTypes = UPDATE_CPM_TYPES;

        $scope.goToEditPage = goToEditPage;
        $scope.openUpdateCpm = openUpdateCpm;

        function goToEditPage(baseState) {
            performanceReportHelper.goToEditPage(baseState, relativeEntityData.id);
        }

        function openUpdateCpm(type) {
            performanceReportHelper.openUpdateCpm(relativeEntityData, type, reportGroup);
        }
    }
})();