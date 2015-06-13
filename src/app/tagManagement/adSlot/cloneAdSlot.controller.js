(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adSlot')
        .controller('CloneAdSlot', CloneAdSlot)
    ;

    function CloneAdSlot($scope, $state, adSlot, $modalInstance, Manager, AlertService, SiteManager, adminUserManager, Auth, historyStorage, HISTORY_TYPE_PATH) {
        $scope.adSlot = adSlot;
        $scope.cloneAdSlot = angular.copy($scope.adSlot);

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.cloneAdSlotForm.$valid;
        }

        _update();
        function _update() {
            if(!Auth.isAdmin()) {
                SiteManager.getList()
                    .then(function(sites) {
                        $scope.sites = sites.plain();
                    })
            }
            else {
                adminUserManager.one(adSlot.site.publisher.id).getList('sites')
                    .then(function(sites) {
                        $scope.sites = sites.plain();
                    })
            }
        }

        function submit() {
            $modalInstance.close();

            Manager.one($scope.cloneAdSlot.id).customPOST({name: $scope.cloneAdSlot.name, site: $scope.cloneAdSlot.site}, 'clone')
                .then(function() {
                    $state.current.reloadOnSearch = true;
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);
                    $state.current.reloadOnSearch = false;

                    AlertService.addFlash({
                        type: 'success',
                        message: 'The ad slot has been cloned successfully'
                    });
                })
                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'Could not clone the ad slot'
                    });
                });
        }
    }
})();