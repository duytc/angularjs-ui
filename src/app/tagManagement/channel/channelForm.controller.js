(function() {
    'use strict';

    angular.module('tagcade.tagManagement.channel')
        .controller('ChannelForm', ChannelForm)
    ;

    function ChannelForm($scope, $filter, $translate, sites, channel, publishers, AlertService, ChannelManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            sites: 'Sites'
        };

        $scope.isNew = channel === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;
        $scope.sites = !$scope.isAdmin() ? sites : [];

        $scope.data = {
            sites: []
        };

        $scope.channel = channel || {
            name: null,
            channelSites: []
        };

        $scope.backToListChannel = backToListChannel;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function backToListChannel() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.channel, '^.list');
        }

        function selectPublisher(publisher) {
            $scope.sites = $filter('selectedPublisher')(sites, publisher);

            $scope.data.sites = [];
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

            var saveChannel = $scope.isNew ? ChannelManager.post($scope.channel) : ChannelManager.one($scope.channel.id).patch({name: $scope.channel.name});

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
                        message: $scope.isNew ? $translate.instant('CHANNEL_MODUlE.ADD_NEW_SUCCESS') : $translate.instant('CHANNEL_MODUlE.UPDATE_SUCCESS')
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