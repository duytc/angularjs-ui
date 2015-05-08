(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $state, $stateParams, $q, SiteManager, AdSlotManager, DynamicAdSlotManager, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot, TYPE_AD_SLOT) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height',
            defaultAdSlot: 'Default Ad Slot'
        };

        $scope.isNew = adSlot === null;
        $scope.types = TYPE_AD_SLOT;

        $scope.formProcessing = false;

        $scope.allowSiteSelection = $scope.isNew && !!siteList;

        $scope.submit = submit;
        $scope.selectPublisher = selectPublisher;
        $scope.selectSite = selectSite;
        $scope.selectType = selectType;
        $scope.isFormValid = isFormValid;

        // required by ui select
        $scope.selected = {
            publisher: site && site.publisher,
            type:  $scope.types[0]
        };

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;

        $scope.adSlot = adSlot || {
            site: $scope.isNew && $stateParams.hasOwnProperty('siteId') ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            expressions: []
        };

        _update();

        function selectSite(siteId) {
            if(!!$scope.adSlot.defaultAdSlot) {
                $scope.adSlot.defaultAdSlot = null;
            }

            return _getAdSlots(siteId)
        }

        function selectType(type) {
            if(type != $scope.types[0] && !!$scope.adSlot.site) {
                _getAdSlots($scope.adSlot.site, type);
            }
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
        }

        function isFormValid() {
            return $scope.adSlotForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if($scope.selected.type != $scope.types[0]) {
                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
            }
            else {
                delete $scope.adSlot.expressions;
                delete $scope.adSlot.defaultAdSlot;
            }

            delete $scope.adSlot.type;

            var Manager = $scope.selected.type != $scope.types[0] ? DynamicAdSlotManager : AdSlotManager;
            var saveAdSlot = $scope.isNew ? Manager.post($scope.adSlot) : $scope.adSlot.patch();

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
        }

        function _getAdSlots(siteId, type) {
            type = !!type ? type : $scope.selected.type;

            if((!$scope.isNew && !$scope.adSlot.width) || ($scope.isNew && type != $scope.types[0])) {
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
                        angular.forEach($scope.adSlot.expressions, function(expressionDescriptor) {
                            expressionDescriptor.expectAdSlot = null;
                        });
                    }
                });
            }
        }

        function _update() {
            if(!$scope.isNew) {
                if(!$scope.adSlot.width) {
                    $scope.selected.type = $scope.types[1];
                    _getAdSlots($scope.adSlot.site.id);
                }
            }
            if($scope.isNew && !!$stateParams.siteId) {
                if($scope.selected.type != $scope.types[0]) {
                    _getAdSlots($stateParams.siteId);
                }
            }
        }
    }
})();