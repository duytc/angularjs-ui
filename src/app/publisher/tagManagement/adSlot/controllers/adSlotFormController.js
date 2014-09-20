angular.module('tagcade.publisher.tagManagement.adSlot')

    .controller('PublisherAdSlotFormController', function ($scope, $state, $stateParams, $q, AdSlotManager, AlertService, ServerErrorProcessor, sites, adSlot) {
        'use strict';

        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;
        $scope.formProcessing = false;

        $scope.sites = sites;

        $scope.adSlot = adSlot || {
            site: $scope.isNew && $stateParams.hasOwnProperty('siteId') ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            width: null,
            height: null
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
                        return $state.go('^.list', {
                            siteId: $scope.adSlot.site
                        });
                    }
                )
            ;
        };
    })

;