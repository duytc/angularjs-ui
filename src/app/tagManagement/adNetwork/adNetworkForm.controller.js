(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $translate, AdNetworkCache, AdNetworkManager, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;

        $scope.allowPublisherSelection = $scope.isAdmin();
        $scope.publishers = publishers;
        $scope.getPageTitle = getPageTitle;
        $scope.backToListAdNetwork = backToListAdNetwork;

        $scope.adNetwork = adNetwork || {
            name: null,
            defaultCpmRate: null,
            url: null
        };

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        function getPageTitle() {
            return $scope.isNew
                ? $translate.instant('AD_NETWORK_MODULE.PAGE_TITLE_NEW_AD_NETWORK')
                : ($translate.instant('AD_NETWORK_MODULE.PAGE_TITLE_EDIT_AD_NETWORK') + ' - ' + $scope.adNetwork.name)
        }

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.list');
        }

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveAdNetwork = $scope.isNew ? AdNetworkCache.postAdNetwork($scope.adNetwork) : AdNetworkCache.patchAdNetwork($scope.adNetwork);

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
                            message: $scope.isNew ? $translate.instant('AD_NETWORK_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_NETWORK_MODULE.UPDATE_SUCCESS')
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