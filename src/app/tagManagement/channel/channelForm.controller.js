(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelForm', ChannelForm)
    ;

    function ChannelForm($scope, $filter, $translate, sites, channel, publishers, AlertService, ChannelManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, RTB_STATUS_TYPES, userSession) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            sites: 'Sites'
        };

        $scope.isNew = channel === null;
        $scope.formProcessing = false;
        var enabledModules = null;

        $scope.publishers = publishers;
        $scope.sites = !$scope.isAdmin() ? sites : [];

        $scope.data = {
            sites: []
        };

        $scope.rtbStatusTypes = RTB_STATUS_TYPES;

        $scope.channel = channel || {
            name: null,
            channelSites: [],
            rtbStatus: RTB_STATUS_TYPES.disable
        };

        $scope.rtbStatusChanged = rtbStatusChanged;
        $scope.isEnabledModuleRtb = isEnabledModuleRtb;

        $scope.backToListChannel = backToListChannel;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function rtbStatusChanged(rtbStatus) {
            $scope.channel.rtbStatus = rtbStatus;
        }

        function isEnabledModuleRtb() {
            return isEnabledModule('MODULE_RTB');
        }

        function isEnabledModule(module) {
            if(!$scope.isAdmin()) {
                enabledModules = userSession.enabledModules
            }

            if($scope.isNew) {
                return enabledModules != null ? enabledModules.indexOf(module) > -1 : false;
            }

            return $scope.channel.publisher != null ? $scope.channel.publisher.enabledModules.indexOf(module) > -1 : false;
        }

        function backToListChannel() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.channel, '^.list');
        }

        function selectPublisher(publisher) {
            $scope.sites = $filter('selectedPublisher')(sites, publisher);

            $scope.data.sites = [];

            enabledModules = publisher.enabledModules;
        }

        function isFormValid() {
            return $scope.channelForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            // refactor json channel
            if($scope.isNew) {
                angular.forEach($scope.data.sites, function(site) {
                    $scope.channel.channelSites.push({site: site.id})
                });
            }

            // not include rtbStatus if module rtb not enabled in publisher
            if (!$scope.isEnabledModuleRtb()) {
                delete $scope.channel.rtbStatus;
            }

            var saveChannel = $scope.isNew
                ? ChannelManager.post($scope.channel)
                : ChannelManager.one($scope.channel.id).patch(
                {
                    name: $scope.channel.name,
                    rtbStatus: $scope.channel.rtbStatus
                });

            saveChannel
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.channelForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('CHANNEL_MODULE.ADD_NEW_SUCCESS') : $translate.instant('CHANNEL_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.channel, '^.list');
                }
            )
            ;
        }
    }
})();