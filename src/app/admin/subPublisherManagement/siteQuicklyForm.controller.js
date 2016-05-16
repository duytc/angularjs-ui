(function() {
    'use strict';

    angular.module('tagcade.admin.subPublisher')
        .controller('SiteQuicklyForm', SiteQuicklyForm)
    ;

    function SiteQuicklyForm($scope, $modalInstance, $translate, Auth, SiteCache, AlertService, ServerErrorProcessor, publishers, channels, RTB_STATUS_TYPES) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            domain: 'Domain'
        };

        $scope.formProcessing = false;
        var enabledModules = null;
        var userSession = Auth.getSession();
        var isAdmin = Auth.isAdmin();

        $scope.allowPublisherSelection = isAdmin && !!publishers;
        $scope.publishers = publishers;
        $scope.channels = !isAdmin ? channels : [];
        $scope.rtbStatusTypes = RTB_STATUS_TYPES;

        $scope.rtbStatusChanged = rtbStatusChanged;
        $scope.selectPublisher = selectPublisher;
        $scope.isEnabledModule = isEnabledModule;
        $scope.isFormValid = isFormValid;
        $scope.backToListSite = backToListSite;
        $scope.toggleVideoPlayer =  toggleVideoPlayer;
        $scope.hasVideoPlayer =  hasVideoPlayer;
        $scope.submit =  submit;

        $scope.site = {
            name: null,
            domain: null,
            enableSourceReport: false,
            players: [],
            channelSites: [],
            rtbStatus: RTB_STATUS_TYPES.inherit
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

        function rtbStatusChanged(rtbStatus) {
            $scope.site.rtbStatus = rtbStatus;
        }

        function selectPublisher(publisher) {
            $scope.channels = $filter('selectedPublisher')(channels, publisher);

            $scope.data.channels = [];
            enabledModules = publisher.enabledModules
        }

        function isEnabledModule(module) {
            if(!isAdmin) {
                enabledModules = userSession.enabledModules
            }

            return enabledModules != null ? enabledModules.indexOf(module) > -1 : false;
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

            // refactor json site
            angular.forEach($scope.data.channels, function(channel) {
                $scope.site.channelSites.push({channel: channel.id})
            });

            // not include rtbStatus if module rtb not enabled in publisher
            if (!isEnabledModule('MODULE_RTB')) {
                delete $scope.site.rtbStatus;
            }

            if(!isEnabledModule('MODULE_VIDEO_ANALYTICS')) {
                $scope.site.players = null;
            }

            var saveSite = SiteCache.postSite($scope.site);

            saveSite
                .catch(
                function (response) {
                    $modalInstance.close();
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.siteForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    $modalInstance.close();
                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('SITE_MODULE.ADD_NEW_SUCCESS')
                    });
                })
            ;
        }
    }
})();