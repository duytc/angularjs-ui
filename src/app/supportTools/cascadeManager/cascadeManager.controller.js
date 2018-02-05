(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.cascadeManager')
        .controller('CascadeManager', CascadeManager)
    ;

    function CascadeManager($scope, $translate, adNetworks, channels, AdNetworkManager, AlertService, UISelectMethod, adminUserManager, Auth) {
        $scope.adNetworks = null;
        $scope.sites = null;
        $scope.channels = channels;

        $scope.selected = {
            publisher : null,
            adNetwork : null,
            position: null,
            deployment: 'sites',
            autoIncreasePosition: false
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

        $scope.deploymentOptions = [
            {
                label: 'Supply',
                key: 'sites'
            },
            {
                label: 'Supply Group',
                key: 'channels'
            }
        ];

        $scope.groupEntities = UISelectMethod.groupEntities;

        $scope.selectPublisher = function() {
            $scope.selected.adNetwork = null;
            $scope.adNetworks = adNetworks;
        };

        $scope.selectAdNetwork = function (adNetworkId) {
            return AdNetworkManager.one(adNetworkId).one('sites').one('active').getList()
                    .then(function (data) {
                        UISelectMethod.addAllOption(data, 'All Supply');
                        $scope.sites = data.plain();
                    })
                ;
        };

        $scope.isFormValid = function() {
            return $scope.positionForm.$valid;
        };

        $scope.submit = function () {
            var savePosition;

            var params = {position: $scope.selected.position, autoIncreasePosition: $scope.selected.autoIncreasePosition};

            if($scope.selected.site && $scope.selected.deployment == 'sites') {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).one('sites', $scope.selected.site).customPUT('', 'position', params);
            }
            else if($scope.selected.channel && $scope.selected.deployment == 'channels') {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).one('channels', $scope.selected.channel).customPUT('', 'position', params);
            }
            else {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).customPUT('', 'position', params);
            }

            savePosition
                .then(
                    function () {
                        AlertService.addAlert({
                            type: 'success',
                            message: $translate.instant('CASCADE_MODULE.UPDATE_SUCCESS')
                        });
                    }
                )
                .catch(
                    function () {
                        AlertService.addAlert({
                            type: 'error',
                            message: $translate.instant('CASCADE_MODULE.UPDATE_SUCCESS')
                        });
                    }
                );
        }
    }
})();