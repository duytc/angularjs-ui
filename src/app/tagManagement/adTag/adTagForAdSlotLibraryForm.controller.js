(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagForAdSlotLibraryForm', AdTagForAdSlotLibraryForm)
    ;

    function AdTagForAdSlotLibraryForm($scope, $state, AlertService, ServerErrorProcessor, adTag, adSlot, adNetworkList, AD_TYPES, LIBRARY_AD_SLOT_TYPE, NativeAdSlotLibrariesManager, DisplayAdSlotLibrariesManager, AdSlotLibrariesManager) {
        $scope.fieldNameTranslations = {
            adSlot: 'Ad Slot',
            name: 'Name',
            position: 'Position',
            active: 'Active',
            adType: 'AdType'
        };

        $scope.editorOptions = {
            lineWrapping : true,
            indentUnit: 0,
            mode : "htmlmixed"
        };

        $scope.selected = {
            adSlot: adSlot
        };
        _update();

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;

        $scope.libraryAdSlotTypes = LIBRARY_AD_SLOT_TYPE;
        $scope.adTypes = AD_TYPES;
        $scope.adNetworkList = adNetworkList;
        $scope.adTag = {
            name: null,
            libraryAdTag: {
                html: null,
                adNetwork: null,
                adType: $scope.adTypes.customAd,
                descriptor: null,
                referenceName: null
            },
            position: null,
            active: true
        };
        if(!!$scope.adTag.libraryAdTag.descriptor) {
            if(!$scope.adTag.libraryAdTag.descriptor.imageUrl) {
                $scope.adTag.libraryAdTag.descriptor = null;
            }
        }

        $scope.showInputPosition = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.libraryAdSlotTypes.display ? true : false;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.selectAdSlot = selectAdSlot;

        function isFormValid() {
            return $scope.adTagForm.$valid;
        }

        function selectAdSlot(adSlot) {
            $scope.showInputPosition = adSlot && adSlot.libType == $scope.libraryAdSlotTypes.display ? true : false;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.adTag.libraryAdTag.adNetwork = $scope.adTag.libraryAdTag.adNetwork.id ? $scope.adTag.libraryAdTag.adNetwork.id : $scope.adTag.libraryAdTag.adNetwork;
            $scope.adTag.libraryAdTag.referenceName = $scope.adTag.name;

            var Manager = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.libraryAdSlotTypes.display ? DisplayAdSlotLibrariesManager : NativeAdSlotLibrariesManager;
            var saveAdTag = Manager.one($scope.selected.adSlot.id).post('adtag', $scope.adTag);
            saveAdTag
                .catch(function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The ad tag has been created'
                    });
                })
                .then(function () {
                    var state = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.libraryAdSlotTypes.display ? '^.displayLibraryList' : '^.nativeLibraryList';

                    return $state.go(state, {adSlotId: $scope.selected.adSlot.id});
                }
            )
            ;
        }

        function _update() {
            return AdSlotLibrariesManager.getList()
                .then(function(libraryAdSlots) {
                    $scope.adSlotList = libraryAdSlots.plain();
                });
        }
    }
})();