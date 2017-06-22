(function () {
    'use strict';

    angular
        .module('tagcade.unifiedReport.connect')
        .controller('CloneConnectedDataSource', CloneConnectedDataSource)
    ;

    function CloneConnectedDataSource($scope, $state, connect, UnifiedReportConnectDataSourceManager, $modalInstance, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.connect = connect;
        $scope.cloneConnect = angular.copy($scope.connect);

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.cloneForm.$valid;
        }


        function submit() {
            $modalInstance.close();

            UnifiedReportConnectDataSourceManager.one($scope.cloneConnect.id).customPOST({name: $scope.cloneConnect.name}, 'clones')
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.connectDataSource, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: 'The connected data source has been cloned successfully'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not clone the connected data source'
                    });
                });
        }
    }
})();