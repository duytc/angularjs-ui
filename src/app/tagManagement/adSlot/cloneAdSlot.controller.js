(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adSlot')
        .controller('CloneAdSlot', CloneAdSlot)
    ;

    function CloneAdSlot($scope, $state, adSlot, $modalInstance, AdSlotManager, AlertService) {
        $scope.adSlot = adSlot;
        $scope.cloneAdSlot = angular.copy($scope.adSlot);

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.cloneAdSlotForm.$valid;
        }

        function submit() {
            $modalInstance.close();

            AdSlotManager.one($scope.cloneAdSlot.id).customPOST({name: $scope.cloneAdSlot.name}, 'clone')
                .then(function() {
                    $state.current.reloadOnSearch = true;
                    $state.reload();
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