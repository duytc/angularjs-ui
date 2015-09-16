(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adSlot')
        .controller('CloneAdSlot', CloneAdSlot)
    ;

    function CloneAdSlot($scope, $translate, $state, adSlot, $modalInstance, Manager, AlertService, SiteManager, adminUserManager, Auth, historyStorage, HISTORY_TYPE_PATH) {
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

            Manager.one($scope.cloneAdSlot.id).customPOST({name: $scope.cloneAdSlot.libraryAdSlot.name, site: $scope.cloneAdSlot.site}, 'clone')
                .then(function() {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AD_SLOT_MODULE.CLONE_SUCCESS')
                    });
                })
                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('AD_SLOT_MODULE.CLONE_FAIL')
                    });
                });
        }
    }
})();