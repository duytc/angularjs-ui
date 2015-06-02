(function() {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('SiteForm', SiteForm)
    ;

    function SiteForm($scope, SiteManager, AlertService, ServerErrorProcessor, site, publishers, userSession, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            domain: 'Domain'
        };

        $scope.isNew = site === null;
        $scope.formProcessing = false;
        var enabledModules = null;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publishers = publishers;

        $scope.selectPublisher = selectPublisher;
        $scope.isEnabledAnalytics = isEnabledAnalytics;
        $scope.isFormValid = isFormValid;
        $scope.backToListSite = backToListSite;

        $scope.site = site || {
            name: null,
            domain: null
        };

        function isFormValid() {
            return $scope.siteForm.$valid;
        }

        function selectPublisher(publisher) {
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