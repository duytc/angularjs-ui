(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagForm', LibraryAdTagForm)
    ;

    function LibraryAdTagForm($scope, AlertService, ServerErrorProcessor, adTag, adNetworkList, AdTagLibrariesManager, historyStorage, AD_TYPES, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            adNetwork: 'adNetwork',
            html: 'html'
        };

        $scope.editorOptions = {
            lineWrapping : true,
            indentUnit: 0,
            mode : "htmlmixed"
        };

        $scope.isNew = adTag === null;
        $scope.adTypes = AD_TYPES;
        $scope.formProcessing = false;
        $scope.adNetworkList = adNetworkList;
        $scope.adTag = adTag || {
            html: null,
            adNetwork: null,
            adType: $scope.adTypes.customAd,
            descriptor: null
        };

        if(!!$scope.adTag.descriptor) {
            if(!$scope.adTag.descriptor.imageUrl) {
                $scope.adTag.descriptor = null;
            }
        }

        $scope.isFormValid = function() {
            return $scope.adTagLibraryForm.$valid;
        };

        $scope.backToAdTagLibraryList = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveAdTagLibrary =  $scope.isNew ? AdTagLibrariesManager.post($scope.adTag) : $scope.adTag.patch();
            saveAdTagLibrary
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagLibraryForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                }
            )
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The ad tag has been ' + ($scope.isNew ? 'created' : 'updated')
                    });
                }
            )
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
                }
            )
            ;
        };
    }
})();