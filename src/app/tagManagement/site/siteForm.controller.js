(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteForm', SiteForm)
    ;

    function SiteForm($scope, $filter, SiteManager, AlertService, ServerErrorProcessor, site, publishers, channels, userSession, historyStorage, HISTORY_TYPE_PATH) {
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
        $scope.isEnabledAnalytics = isEnabledAnalytics;
        $scope.isFormValid = isFormValid;
        $scope.backToListSite = backToListSite;

        $scope.site = site || {
            name: null,
            domain: null,
            channelSites: []
        };

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

        function isEnabledAnalytics() {
            if(!$scope.isAdmin()) {
                enabledModules = userSession.enabledModules
            }

            if($scope.isNew) {
                return enabledModules != null ? enabledModules.indexOf('MODULE_ANALYTICS') > -1 : false;
            }

            return $scope.site.publisher != null ? $scope.site.publisher.enabledModules : false;
        }

        function backToListSite() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.list');
        }

        $scope.submit = function() {
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

            var saveSite = $scope.isNew ? SiteManager.post($scope.site) : $scope.site.patch();

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
                            message: 'The site has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    }
                )
                .then(
                    function () {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, '^.list');
                    }
                )
            ;
        };
    }
})();