(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('CreateRonAdSlotForAdSlots', CreateRonAdSlotForAdSlots)
    ;

    function CreateRonAdSlotForAdSlots($scope, $q, adSlotLib, ronAdSlot, segments, $translate, RonAdSlotManager, AlertService, ServerErrorProcessor, Auth, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        var isAdmin = Auth.isAdmin();
        var isNew = !!adSlotLib;
        $scope.isNew = isNew;

        $scope.adSlotLib = adSlotLib || ronAdSlot.libraryAdSlot;
        $scope.segments = segments;

        $scope.formProcessing = false;
        $scope.ronAdSlotSegments = [];

        $scope.ronAdSlot = ronAdSlot || {
            libraryAdSlot: $scope.adSlotLib.id || null,
            ronAdSlotSegments: []
        };

        _update();

        $scope.submit = submit;
        $scope.addItem = addItem;

        function addItem(query) {
            return {
                name: query
            };
        }

        function submit(){
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            _refactorJson();

            var saveAdSlot = isNew ? RonAdSlotManager.post($scope.ronAdSlot) : $scope.ronAdSlot.patch();

            saveAdSlot
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.ronAdSlotForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;
                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: isNew ? $translate.instant('RON_AD_SLOT_MODULE.ADD_NEW_SUCCESS') : $translate.instant('RON_AD_SLOT_MODULE.UPDATE_SUCCESS')
                    });
                },
                function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('RON_AD_SLOT_MODULE.ADD_NEW_FAIL')
                    });

                    return $q.reject();
                })
                .then(function() {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.list');
                })
            ;
        }

        function _refactorJson() {
            $scope.ronAdSlot.ronAdSlotSegments = [];

            angular.forEach($scope.ronAdSlotSegments, function(ronAdSlotSegment) {
                if(!!ronAdSlotSegment.id) {
                    $scope.ronAdSlot.ronAdSlotSegments.push({segment: ronAdSlotSegment.id});
                }
                else {
                    var segment = {name: ronAdSlotSegment.name};

                    if(isAdmin) {
                        segment['publisher'] = $scope.adSlotLib.publisher.id;
                    }

                    $scope.ronAdSlot.ronAdSlotSegments.push({segment: segment});
                }
            });
        }

        function _update() {
            if(isAdmin) {
                $scope.ronAdSlot['publisher'] = $scope.adSlotLib.publisher.id;
            }

            if(!isNew) {
                angular.forEach(ronAdSlot.ronAdSlotSegments, function(ronAdSlotSegment) {
                    $scope.ronAdSlotSegments.push(ronAdSlotSegment.segment);
                });
            }
        }
    }
})();