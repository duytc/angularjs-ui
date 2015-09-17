(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteForm', SiteForm)
    ;

    function SiteForm($scope, $translate, $filter, SiteCache, AlertService, ServerErrorProcessor, site, publishers, channels, userSession, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            domain: 'Domain'
        };

        $scope.isNew = site === null;
        $scope.formProcessing = false;
        var enabledModules = null;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publishers = publishers;
        $scope.channels = !$scope.isAdmin() ? channels : [];

        $scope.selectPublisher = selectPublisher;
        $scope.isEnabledModule = isEnabledModule;
        $scope.isFormValid = isFormValid;
        $scope.backToListSite = backToListSite;
        $scope.toggleVideoPlayer =  toggleVideoPlayer;
        $scope.hasVideoPlayer =  hasVideoPlayer;
        $scope.submit =  submit;

        $scope.site = site || {
            name: null,
            domain: null,
            players: [],
            channelSites: []
        };

        $scope.videoPlayers = [
            { label: '5min', name: '5min'},
            { label: 'Defy', name: 'defy' },
            { label: 'JwPlayer5', name: 'jwplayer5' },
            { label: 'JwPlayer6', name: 'jwplayer6' },
            { label: 'Limelight', name: 'limelight' },
            { label: 'Ooyala', name: 'ooyala' },
            { label: 'Scripps', name: 'scripps' },
            { label: 'ULive', name: 'ulive' }
        ];

        $scope.data = {
          channels: []
        };

        function isFormValid() {
            return $scope.siteForm.$valid;
        }

        function selectPublisher(publisher) {
            $scope.channels = $filter('selectedPublisher')(channels, publisher);

            $scope.data.channels = [];
            enabledModules = publisher.enabledModules
        }

        function isEnabledModule(module) {
            if(!$scope.isAdmin()) {
                enabledModules = userSession.enabledModules
            }

            if($scope.isNew) {
                return enabledModules != null ? enabledModules.indexOf(module) > -1 : false;
            }

            return $scope.site.publisher != null ? $scope.site.publisher.enabledModules.indexOf(module) > -1 : false;
        }

        function backToListSite() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.list');
        }

        function hasVideoPlayer(player) {
            if(!$scope.site.players) {
                return false;
            }

            return $scope.site.players.indexOf(player) > -1;
        }

        function toggleVideoPlayer(player) {
            var idx = $scope.site.players.indexOf(player);

            if (idx > -1) {
                $scope.site.players.splice(idx, 1);
            } else {
                $scope.site.players.push(player);
            }
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            // refactor json channel
            if($scope.isNew) {
                angular.forEach($scope.data.channels, function(channel) {
                    $scope.site.channelSites.push({channel: channel.id})
                });
            } else {
                delete $scope.site.channels;
            }

            if(!isEnabledModule('MODULE_VIDEO_ANALYTICS')) {
                $scope.site.players = null;
            }

            var saveSite = $scope.isNew ? SiteCache.postSite($scope.site) : SiteCache.patchSite($scope.site);

            saveSite
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.siteForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('SITE_MODULE.ADD_NEW_SUCCESS') : $translate.instant('SITE_MODULE.UPDATE_SUCCESS')
                        });
                    }
                )
                .then(
                    function () {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.list');
                    }
                )
            ;
        }
    }
})();