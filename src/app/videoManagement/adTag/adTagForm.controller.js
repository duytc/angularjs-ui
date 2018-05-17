(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .controller('VideoAdTagForm', VideoAdTagForm)
    ;

    function VideoAdTagForm($scope, $q, $stateParams, $translate, userSession, adTag, videoPublishers, optimizeIntegrations, publishers, AlertService, NumberConvertUtil, VideoAdTagManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            platform: 'platform',
            companionAds: "companionAds"
        };

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;
        $scope.videoPublishers = videoPublishers;
        $scope.publishers = filterPublishersByVideo(publishers || []);
        $scope.platformOption = PLATFORM_OPTION;

        $scope.playerSizeOptions = PLAYER_SIZE_OPTIONS;

        $scope.adTag = adTag || {
            videoPublisher: $stateParams.videoPublisherId || null,
            name: null,
            buyPrice: null,
            platform: null,
            companionAds: [],
            runOn: 'Client-Side VAST+VPAID',
            targeting: {
                player_size: []
            }
        };

        $scope.runOns = [
            {key: 'Client-Side VAST+VPAID', label: 'Client-Side VAST+VPAID'},
            {key: 'Server-Side VAST+VPAID', label: 'Server-Side VAST+VPAID'},
            {key: 'Server-Side VAST Only', label: 'Server-Side VAST Only'}
        ];

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
        var enabledModules = !!$scope.selected.publisher ? $scope.selected.publisher.enabledModules : null;
        $scope.optimizationIntegration = {};
        $scope.backToListAdTag = backToListAdTag;
        $scope.selectPublisher = selectPublisher;
        $scope.selectVideoPublisher = selectVideoPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addCompanion = addCompanion;
        $scope.toggleTargeting = toggleTargeting;
        $scope.hasTargeting = hasTargeting;
        $scope.onChangeIntegration = onChangeIntegration;
        $scope.isAutoOptimizeModule = isAutoOptimizeModule;
        $scope.selectedVideoPublisher = adTag ? adTag.videoPublisher : {};
        $scope.integrations = optimizeIntegrations;

        function isAutoOptimizeModule() {
            return isEnabledModule('MODULE_AUTO_OPTIMIZE');
        }

        function isEnabledModule(module) {
            if (!$scope.isAdmin()) {
                enabledModules = userSession.enabledModules
            } else {
                enabledModules = [module];
            }

            if ($scope.isNew) {
                return enabledModules != null ? enabledModules.indexOf(module) > -1 : false;
            }

            return $scope.adTag.videoPublisher.publisher != null ? $scope.adTag.videoPublisher.publisher.enabledModules.indexOf(module) > -1 : false;
        }

        function onChangeIntegration(integration) {
            if(_.isObject($scope.adTag))
            {
                $scope.optimizationIntegration = integration || {};
                $scope.adTag.optimizationIntegration = integration.id;
            }
        }

        function filterPublishersByVideo(publishers) {
            return _.filter(publishers, function(publisher) {
                return _.contains(_.values(publisher.enabledModules), 'MODULE_VIDEO');
                //return _.findWhere(_.pluck(videoPublishers, 'publisher'), {id: publisher.id})
            });
        }

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

        function selectPublisher() {
            $scope.selectedVideoPublisher = {};
            $scope.adTag.videoPublisher = null;
        }

        function selectVideoPublisher($item) {
            $scope.selectedVideoPublisher = $item || {};
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