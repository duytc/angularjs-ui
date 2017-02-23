(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adSlot')
        .controller('CloneReportView', CloneReportView)
    ;

    function CloneReportView($scope, $state, $modalInstance, AlertService, reportView, UnifiedReportViewManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.reportView = reportView;

        $scope.cloneReportView = {
            name: null,
            alias: null
        };

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;

        function isFormValid() {
            return $scope.cloneReportViewForm.$valid;
        }

        function submit() {
            $modalInstance.close();

            var params = {
                cloneSettings: [$scope.cloneReportView]
            };

            UnifiedReportViewManager.one(reportView.id).post('clone', params)
                .then(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: "The report view has been cloned successfully"
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: "Could not clone the report view"
                    });
                })
        }
    }
})();