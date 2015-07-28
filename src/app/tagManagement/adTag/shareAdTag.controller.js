(function () {
    'use strict';

    angular
        .module('tagcade.tagManagement.adTag')
        .controller('ShareAdTag', ShareAdTag)
    ;

    function ShareAdTag($scope, adTag, $modalInstance, AdTagManager, AlertService) {
        $scope.adTag = adTag;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        $scope.adTag.libraryAdTag.referenceName = $scope.adTag.name;

        function isFormValid() {
            return $scope.shareAdSlotForm.$valid;
        }


        function submit() {
            $modalInstance.close();

            var libraryAdTag = {
                visible: true,
                referenceName: $scope.adTag.libraryAdTag.referenceName
            };

            AdTagManager.one(adTag.id).patch({libraryAdTag: libraryAdTag})
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'The ad tag has not been moved library'
                    });
                })
                .then(function () {
                    adTag.libraryAdTag.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The ad tag has been moved library'
                    });
                })
            ;
        }
    }
})();