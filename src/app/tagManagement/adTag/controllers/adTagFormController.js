angular.module('tagcade.tagManagement.adTag')

    .controller('AdTagFormController', function (
        $scope, $state, $stateParams, $q, SiteManager, AdTagManager, AlertService, ServerErrorProcessor, adTag, adSlot, site, siteList, adNetworkList
    ) {
        'use strict';

        $scope.fieldNameTranslations = {
            adSlot: 'Ad Slot',
            adNetwork: 'Ad Network',
            name: 'Name',
            html: 'Html',
            position: 'Position',
            active: 'Active'
        };

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;

        // !! converts a variable to a boolean
        // we are saying, if we don't have a predefined ad slot but we have a list of all ad slots, allow the user to choose
        $scope.allowAdSlotSelection = $scope.isNew && (!site && !!siteList);

        // required by ui select
        $scope.selected = {
            siteId: null
        };

        $scope.siteList = siteList;
        $scope.adSlotList = [];

        $scope.site = site;
        $scope.adSlot = adSlot;

        $scope.adNetworks = adNetworkList;

        $scope.adTag = adTag || {
            adSlot: null,
            adNetwork: null,
            html: null,
            position: null,
            active: true
        };

        $scope.selectSite = function (site, siteId) {
            $scope.adTag.adSlot = null;
            $scope.adSlotList = [];

            SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                $scope.adSlotList = adSlots.plain();
            });
        };

        $scope.isFormValid = function() {
            return $scope.adTagForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveAdTag = $scope.isNew ? AdTagManager.post($scope.adTag) : $scope.adTag.patch();

            saveAdTag
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad tag has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    }
                )
                .then(
                    function () {
                        return $state.go('^.list', {
                            adSlotId: $scope.adTag.adSlot
                        });
                    }
                )
            ;
        };
    })

;