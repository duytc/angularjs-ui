(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagForm', LibraryAdTagForm)
    ;

    function LibraryAdTagForm($scope, $modal, $translate, AlertService, ServerErrorProcessor, AdNetworkCache, adTag, publisherList, adNetworkList, AdTagLibrariesManager, historyStorage, AD_TYPES, HISTORY_TYPE_PATH) {
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
        $scope.publisherList = publisherList;

        $scope.adTag = adTag || {
            html: null,
            adNetwork: null,
            adType: $scope.adTypes.customAd,
            descriptor: null
        };

        $scope.selected = {
            publisher: !$scope.isNew ? adTag.adNetwork.publisher : null
        };

        if(!!$scope.adTag.descriptor) {
            if(!$scope.adTag.descriptor.imageUrl) {
                $scope.adTag.descriptor = null;
            }
        }

        $scope.isFormValid = function() {
            return $scope.adTagLibraryForm.$valid;
        };

        $scope.selectPublisher = function() {
            $scope.adTag.adNetwork = null;
        };

        $scope.backToAdTagLibraryList = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        };

        $scope.createAdNetwork = function() {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(adminUserManager){
                        if(!!publisherList) {
                            return publisherList;
                        }

                        return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                            return users.plain();
                        });
                    }
                }
            });

            modalInstance.result.then(function () {
                AdNetworkCache.getAllAdNetworks()
                    .then(function(adNetworks) {
                        $scope.adNetworkList = adNetworks;
                    });
            })
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
                        message: $scope.isNew ? $translate.instant('AD_TAG_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
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