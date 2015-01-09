(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.cascadeManager')
        .controller('CascadeManager', CascadeManager)
    ;

    function CascadeManager($scope, adNetworks, AdNetworkManager, AlertService) {
        $scope.adNetworks = adNetworks;
        $scope.sites = null;

        $scope.selected = {
            adNetwork : null,
            site : null,
            position: null
        };

        $scope.selectAdNetwork = function (publisher, publisherId) {
            $scope.selected.site = null;
            return AdNetworkManager.one(publisherId).one('sites').one('active').getList().then(function (sites) {
                $scope.sites = sites.plain();
            });
        };

        $scope.isFormValid = function() {
            return  $scope.selected.adNetwork != null &&
                    $scope.selected.site != null &&
                    $scope.selected.position != null;
        };

        $scope.submit = function () {

            var savePosition = AdNetworkManager.one($scope.selected.adNetwork).one('sites', $scope.selected.site).customPUT('', 'position', {position: $scope.selected.position});
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