(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $state, $q, AdNetworkManager, AlertService, ServerErrorProcessor, adNetwork, publishers) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            url: 'Url',
            active: 'Active'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publishers = publishers;

        $scope.adNetwork = adNetwork || {
            name: null,
            url: null,
            active: true
        };

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveAdNetwork = $scope.isNew ? AdNetworkManager.post($scope.adNetwork) : $scope.adNetwork.patch();

            saveAdNetwork
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adNetworkForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad network has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    }
                )
                .then(
                    function () {
                        return $state.go('^.list');
                    }
                )
            ;
        };
    }
})();