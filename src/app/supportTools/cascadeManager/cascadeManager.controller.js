(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.cascadeManager')
        .controller('CascadeManager', CascadeManager)
    ;

    function CascadeManager($scope, adNetworks, AdNetworkManager, AlertService, UISelectMethod) {
        $scope.adNetworks = adNetworks;
        $scope.sites = null;

        $scope.selected = {
            adNetwork : null,
            position: null
        };

        $scope.groupEntities = UISelectMethod.groupEntities;

        $scope.selectAdNetwork = function (adNetworkId) {
            return AdNetworkManager.one(adNetworkId).one('sites').one('active').getList()
                    .then(function (data) {
                        UISelectMethod.addAllOption(data, 'All Site');
                        $scope.sites = data.plain();
                    })
                ;
        };

        $scope.isFormValid = function() {
            return $scope.selected.adNetwork != null && $scope.selected.position != null;
        };

        $scope.submit = function () {
            var savePosition;

            if(!$scope.selected.site) {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).customPUT('', 'position', {position: $scope.selected.position});
            }
            else {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).one('sites', $scope.selected.site).customPUT('', 'position', {position: $scope.selected.position});
            }

            savePosition
                .then(
                function () {
                    AlertService.addAlert({
                        type: 'success',
                        message: 'new position is updated.'
                    });
                }
                )
                .catch(
                function () {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'Some error occurs. The position is not updated.'
                    });
                }
                );
        }
    }
})();