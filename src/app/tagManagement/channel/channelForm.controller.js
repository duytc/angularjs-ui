(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelForm', ChannelForm)
    ;

    function ChannelForm($scope, $filter, $translate, sites, channel, publishers, AlertService, ChannelManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, userSession) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            sites: 'Supply'
        };

        $scope.isNew = channel === null;
        $scope.formProcessing = false;
        var enabledModules = null;

        $scope.publishers = publishers;
        $scope.sites = !$scope.isAdmin() ? sites : [];

        $scope.data = {
            sites: []
        };

        $scope.channel = channel || {
            name: null,
            channelSites: [] // only exist when NEW!!!
        };

        $scope.backToListChannel = backToListChannel;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

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
            var channel = refactorJson($scope.channel);

            var saveChannel = $scope.isNew
                ? ChannelManager.post(channel)
                : ChannelManager.one(channel.id).patch(channel);

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

        /**
         * Refactor supply group json before submitting
         */
        function refactorJson(channel) {
            var channel = angular.copy(channel);

            if($scope.isNew) {
                // add sites for channel if sites selected, only when NEW
                angular.forEach($scope.data.sites, function(site) {
                    channel.channelSites.push(
                        { site: site.id }
                    )
                });
            }

            // finally, remove publisher if editing
            if(!$scope.isNew) {
                // TODO: not need clear publisher field???
                delete channel.publisher;
            }

            return channel;
        }
    }
})();