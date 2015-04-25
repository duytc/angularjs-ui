(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $state, $stateParams, $q, SiteManager, AdSlotManager, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;
        $scope.formProcessing = false;

        $scope.allowSiteSelection = $scope.isNew && !!siteList;
        $scope.selectSite = selectSite;
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
            height: null,
            enableVariable: false,
            variableDescriptor : {
                expressions: [{expression: {var: null, cmp: "==", val: null, type: 'STRING'}, expectAdSlot : null}]
            }
        };

        update();
        function update() {
            if($scope.adSlot.variableDescriptor.length == 0) {
                $scope.adSlot.variableDescriptor = {
                    expressions: [{expression: {var: null, cmp: "==", val: null}, expectAdSlot : null}]
                };
            }
            if(!$scope.isNew) {
                selectSite($scope.adSlot.site.id);
            }
        }

        function selectSite(siteId) {
            return SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                $scope.adSlots = adSlots.plain();

                if(!$scope.isNew) {
                    angular.forEach($scope.adSlots, function(adSlot, index) {
                        if(adSlot.id == $scope.adSlot.id) {
                            $scope.adSlots.splice(index, 1);
                        }
                    });
                }

                if($scope.isNew) {
                    angular.forEach($scope.adSlot.variableDescriptor.expressions, function(expression) {
                        expression.expectAdSlot = null;
                    });
                }
            });
        }

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
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'An error occurred. The ad slot could not be ' + ($scope.isNew ? 'created' : 'updated')
                        });

                        return $q.reject();
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