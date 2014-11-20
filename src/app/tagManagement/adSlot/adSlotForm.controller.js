(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $state, $stateParams, $q, AdSlotManager, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;
        $scope.formProcessing = false;

        $scope.allowSiteSelection = $scope.isNew && !!siteList;

        // required by ui select
        $scope.selected = {
            publisher: site && site.publisher
        };

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;

        $scope.adSlot = adSlot || {
            site: $scope.isNew && $stateParams.hasOwnProperty('siteId') ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            width: null,
            height: null
        };

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.adSlot.site = null;
        };

        $scope.isFormValid = function() {
            return $scope.adSlotForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveAdSlot = $scope.isNew ? AdSlotManager.post($scope.adSlot) : $scope.adSlot.patch();

            saveAdSlot
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adSlotForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad slot has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    }
                )
                .then(
                    function () {
                        var siteId = $scope.adSlot.site;

                        if (angular.isObject(siteId)) {
                            siteId = siteId.id;
                        }

                        return $state.go('^.list', {
                            siteId: siteId
                        });
                    }
                )
            ;
        };
    }
})();