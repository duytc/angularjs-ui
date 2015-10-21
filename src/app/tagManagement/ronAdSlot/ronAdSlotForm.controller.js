(function() {
    'use strict';

    angular.module('tagcade.tagManagement.ronAdSlot')
        .controller('RonAdSlotForm', RonAdSlotForm)
    ;

    function RonAdSlotForm($scope, _, $q, $translate, ronAdSlot, libraryAdSlot, segments, publisherList, adSlotLibraryList, AlertService, RonAdSlotManager, historyStorage, ServerErrorProcessor, TYPE_AD_SLOT, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = ronAdSlot === null;
        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.segments = segments;
        $scope.adSlotTypeOptions = [
            {
                label: $translate.instant('DISPLAY_AD_SLOTS'),
                key: TYPE_AD_SLOT.display
            },
            {
                label: $translate.instant('NATIVE_AD_SLOTS'),
                key: TYPE_AD_SLOT.native
            },
            {
                label: $translate.instant('DYNAMIC_AD_SLOTS'),
                key: TYPE_AD_SLOT.dynamic
            }
        ];

        $scope.formProcessing = false;
        $scope.ronAdSlotSegments = [];

        $scope.adSlotLibraryList = adSlotLibraryList;
        $scope.publisherList = publisherList;

        $scope.ronAdSlot = ronAdSlot || {
            libraryAdSlot: libraryAdSlot.id || null,
            ronAdSlotSegments: []
        };

        $scope.selected = {
            publisher: angular.isObject(libraryAdSlot) ? libraryAdSlot.publisher.id : undefined || null,
            type: angular.isObject(libraryAdSlot) ? libraryAdSlot.libType : undefined || TYPE_AD_SLOT.display
        };

        $scope.passbackOption = [
            {
                label: 'Position',
                key: 'position'
            },
            {
                label: 'Peer Priority',
                key: 'peerpriority'
            }
        ];

        $scope.adSlot = null;

        _update();

        $scope.backToListAdSlot = backToListAdSlot;
        $scope.isFormValid = isFormValid;
        $scope.findTypeLabel = findTypeLabel;
        $scope.selectType = selectType;
        $scope.addSegment = addSegment;
        $scope.submit = submit;
        $scope.selectPublisher = selectPublisher;
        $scope.showForDisplayAdSlot = showForDisplayAdSlot;
        $scope.showForNativeAdSlot = showForNativeAdSlot;
        $scope.showForDynamicAdSlot = showForDynamicAdSlot;
        $scope.selectLibraryAdSlot = selectLibraryAdSlot;

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            _refactorJson();

            var saveAdSlot = $scope.isNew ? RonAdSlotManager.post($scope.ronAdSlot) : $scope.ronAdSlot.patch();

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
                        message: $scope.isNew ? $translate.instant('RON_AD_SLOT_MODULE.ADD_NEW_SUCCESS') : $translate.instant('RON_AD_SLOT_MODULE.UPDATE_SUCCESS')
                    });
                },
                function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $scope.isNew ? $translate.instant('RON_AD_SLOT_MODULE.ADD_NEW_FAIL') : $translate.instant('RON_AD_SLOT_MODULE.UPDATE_FAIL')
                    });

                    return $q.reject();
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.ronAdSlot, '^.list');
                }
            )
            ;
        }

        function showForDisplayAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.display;
        }

        function showForDynamicAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.dynamic;
        }

        function selectLibraryAdSlot(adSlot) {
            $scope.adSlot = adSlot
        }

        function showForNativeAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.native;
        }

        function findTypeLabel(type) {
            return _.find($scope.adSlotTypeOptions, function(typeOption)
            {
                return typeOption.key == type;
            });
        }

        function addSegment(query) {
            return {
                name: query
            };
        }

        function selectPublisher() {
            $scope.ronAdSlot.libraryAdSlot = null;
            $scope.ronAdSlotSegments = [];
        }

        function selectType(type) {
            $scope.ronAdSlot.libraryAdSlot = null
        }

        function isFormValid() {
            return !!$scope.ronAdSlot.libraryAdSlot
        }

        function backToListAdSlot() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.ronAdSlot, '^.list');
        }

        function _update() {
            if(!$scope.isNew) {
                $scope.selected.publisher = $scope.ronAdSlot.libraryAdSlot.publisher.id;

                if($scope.isAdmin()) {
                    $scope.ronAdSlot.publisher = $scope.ronAdSlot.libraryAdSlot.publisher.id;
                }

                $scope.selected.type = $scope.ronAdSlot.libraryAdSlot.libType;

                angular.forEach($scope.ronAdSlot.ronAdSlotSegments, function(ronAdSlotSegment) {
                    $scope.ronAdSlotSegments.push(ronAdSlotSegment.segment);
                });

                $scope.adSlot = $scope.ronAdSlot.libraryAdSlot
            }
        }

        function _refactorJson() {
            $scope.ronAdSlot.ronAdSlotSegments = [];

            angular.forEach($scope.ronAdSlotSegments, function(ronAdSlotSegment) {
                if(!!ronAdSlotSegment.id) {
                    $scope.ronAdSlot.ronAdSlotSegments.push({segment: ronAdSlotSegment.id});
                }
                else {
                    $scope.ronAdSlot.ronAdSlotSegments.push({segment: {name: ronAdSlotSegment.name}});
                }
            });
        }
    }
})();