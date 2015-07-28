(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adSlot')
        .controller('ShareAdSlot', ShareAdSlot)
    ;

    function ShareAdSlot($scope, adSlot, $modalInstance, adSlotService, AlertService) {
        $scope.adSlot = adSlot;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        $scope.adSlot.libraryAdSlot.referenceName = $scope.adSlot.name;

        function isFormValid() {
            return $scope.shareAdSlotForm.$valid;
        }


        function submit() {
            $modalInstance.close();

            var libraryAdSlot = {
                visible: true,
                referenceName: $scope.adSlot.libraryAdSlot.referenceName
            };

            var Manager = adSlotService.getManagerForAdSlot(adSlot);
            Manager.one(adSlot.id).patch({libraryAdSlot: libraryAdSlot})
                .then(function () {
                    adSlot.libraryAdSlot.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The ad slot has been moved library'
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad slot has not been moved library'
                    });
                })
            ;
        }
    }
})();