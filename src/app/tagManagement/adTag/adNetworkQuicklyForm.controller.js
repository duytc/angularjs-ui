(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdNetworkQuicklyForm', AdNetworkQuicklyForm)
    ;

    function AdNetworkQuicklyForm($scope, $modalInstance, $translate, AdNetworkCache, AlertService, ServerErrorProcessor, publishers, Auth) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.formProcessing = false;

        $scope.allowPublisherSelection = Auth.isAdmin();
        $scope.publishers = publishers;

        $scope.adNetwork = {
            name: null,
            defaultCpmRate: null,
            url: null
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

            var saveAdNetwork = AdNetworkCache.postAdNetwork($scope.adNetwork);

            saveAdNetwork
                .catch(
                    function (response) {
                        $modalInstance.close();
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adNetworkForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        $modalInstance.close();
                        AlertService.addAlert({
                            type: 'success',
                            message: $translate.instant('AD_NETWORK_MODULE.ADD_NEW_SUCCESS')
                        });
                    }
                )
            ;
        };
    }
})();