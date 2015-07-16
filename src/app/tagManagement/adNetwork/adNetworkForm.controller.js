(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, AdNetworkManager, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publishers = publishers;
        $scope.backToListAdNetwork = backToListAdNetwork;

        $scope.adNetwork = adNetwork || {
            name: null,
            defaultCpmRate: null,
            url: null
        };

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.list');
        }

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
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.list');
                    }
                )
            ;
        };
    }
})();