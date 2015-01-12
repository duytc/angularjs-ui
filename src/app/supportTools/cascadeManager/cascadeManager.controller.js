(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.cascadeManager')
        .controller('CascadeManager', CascadeManager)
    ;

    function CascadeManager($scope, adNetworks, AdNetworkManager, AlertService, UISelectMethod, adminUserManager, Auth) {
        $scope.adNetworks = null;
        $scope.sites = null;

        $scope.selected = {
            publisher : null,
            adNetwork : null,
            position: null
        };

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        if(isAdmin) {
            adminUserManager.getList({ filter: 'publisher' })
                .then(function (users) {
                    $scope.publishers = users.plain();
                })
            ;
        }

        if(!isAdmin) {
            $scope.adNetworks = adNetworks;
        }

        $scope.groupEntities = UISelectMethod.groupEntities;

        $scope.selectPublisher = function() {
            $scope.selected.adNetwork = null;
            $scope.adNetworks = adNetworks;
        };

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