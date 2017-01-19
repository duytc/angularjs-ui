(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .controller('VideoAdTagForm', VideoAdTagForm)
    ;

    function VideoAdTagForm($scope, $q, $stateParams, $translate, adTag, videoPublishers, publishers, AlertService, NumberConvertUtil, VideoAdTagManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            platform: 'platform',
            companionAds: "companionAds"
        };

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;
        $scope.videoPublishers = videoPublishers;
        $scope.publishers = publishers;
        $scope.platformOption = PLATFORM_OPTION;

        $scope.playerSizeOptions = PLAYER_SIZE_OPTIONS;

        $scope.adTag = adTag || {
            videoPublisher: $stateParams.videoPublisherId || null,
            name: null,
            buyPrice: null,
            platform: null,
            companionAds: [],
            isVastOnly: false,
            isServerToServer: false,
            targeting: {
                player_size: []
            }
        };

        if(angular.isArray($scope.adTag.targeting)) {
            $scope.adTag.targeting = {};
            $scope.adTag.targeting.player_size = []
        }

        $scope.selected = {
            publisher: !$scope.isNew ? adTag.videoPublisher.publisher : null
        };

        if(!$scope.isNew) {
            $scope.adTag.buyPrice = NumberConvertUtil.convertPriceToString($scope.adTag.buyPrice);
        }

        $scope.backToListAdTag = backToListAdTag;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addCompanion = addCompanion;
        $scope.toggleTargeting = toggleTargeting;
        $scope. hasTargeting = hasTargeting;

        function hasTargeting(targeting) {
            if(!$scope.adTag.targeting.player_size) {
                return false;
            }

            return $scope.adTag.targeting.player_size.indexOf(targeting) > -1;
        }

        function toggleTargeting(targeting) {
            var idx = $scope.adTag.targeting.player_size.indexOf(targeting);

            if (idx > -1) {
                $scope.adTag.targeting.player_size.splice(idx, 1);
            } else {
                $scope.adTag.targeting.player_size.push(targeting);
            }
        }

        function addCompanion(query) {
            return query;
        }

        function backToListAdTag() {
            if($stateParams.videoPublisherId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoAdTag, '^.listForVideoPublisher');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoAdTag, '^.list');
        }

        function selectPublisher(videoPublisher) {
        }

        function isFormValid() {
            if($scope.adTag.isServerToServer && $scope.adTag.isVastOnly) {
                return $scope.videoAdTagForm.$valid;
            }

            return $scope.videoAdTagForm.$valid && angular.isArray($scope.adTag.platform) && $scope.adTag.platform.length > 0;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.adTag.videoAdTagItems;
            delete $scope.adTag.uuid;
            $scope.adTag.buyPrice = NumberConvertUtil.convertPriceToString($scope.adTag.buyPrice);

            var saveWaterfall = $scope.isNew ? VideoAdTagManager.post($scope.adTag) : $scope.adTag.patch();

            saveWaterfall
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.videoAdTagForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('VIDEO_AD_TAG_MODULE.ADD_NEW_SUCCESS') : $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                    });

                    backToListAdTag();
                },
                function () {
                    if(!$scope.isNew) {
                        var message = null;
                        if($scope.adTag.platform.indexOf('js') == -1) {
                            message = $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_PLATFORM_FAIL_WHEN_REMOVE_JS');
                        } else if($scope.adTag.platform.indexOf('flash') == -1) {
                            message = $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_PLATFORM_FAIL_WHEN_REMOVE_FLASH');
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });

                        return $q.reject();
                    }
                })
            ;
        }
    }
})();