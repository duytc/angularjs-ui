(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagForm', LibraryAdTagForm)
    ;

    function LibraryAdTagForm($scope, Auth, $modal, $translate, AlertService, ServerErrorProcessor, AdNetworkCache, adTag, publisherList, adNetworkList, AdTagLibrariesManager, historyStorage, AD_TYPES, USER_MODULES, PLATFORM_VAST_TAG, HISTORY_TYPE_PATH) {
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
        $scope.platforms = PLATFORM_VAST_TAG;
        $scope.formProcessing = false;
        $scope.adNetworkList = adNetworkList;
        $scope.publisherList = publisherList;

        $scope.adTag = adTag || {
            html: null,
            adNetwork: null,
            adType: $scope.adTypes.customAd,
            descriptor: null,
            inBannerDescriptor: {
                platform: null,
                timeout: null,
                playerWidth: null,
                playerHeight: null,
                vastTags: [{tag: null}]
            }
        };

        $scope.selected = {
            publisher: !$scope.isNew ? adTag.adNetwork.publisher : null
        };

        if(!!$scope.adTag.descriptor) {
            if(!$scope.adTag.descriptor.imageUrl) {
                $scope.adTag.descriptor = null;
            }
        }

        $scope.sortableOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder'
        };

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
                        if(!$scope.isAdmin()) {
                            return null;
                        }

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

        $scope.addVast = function () {
            $scope.adTag.inBannerDescriptor.vastTags.push({
                tag: null
            })
        };

        $scope.removeTag = function (index) {
            if(index > -1) {
                $scope.adTag.inBannerDescriptor.vastTags.splice(index, 1)
            }
        };

        $scope.enableDragDropVastTag = function(enable) {
            $scope.sortableOptions['disabled'] = enable;
        };

        $scope.hasInBanner = function () {
            if($scope.isAdmin() && !$scope.selected.publisher) {
                return false
            } else if($scope.isAdmin() && !!$scope.selected.publisher) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1
            }

            return Auth.getSession().hasModuleEnabled(USER_MODULES.inBanner);
        };

        $scope.moveVastTag = function(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
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