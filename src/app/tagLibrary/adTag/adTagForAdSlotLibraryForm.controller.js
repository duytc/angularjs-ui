(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('AdTagForAdSlotLibraryForm', AdTagForAdSlotLibraryForm)
    ;

    function AdTagForAdSlotLibraryForm($scope, $state, AlertService, ServerErrorProcessor, publisherList, adTag, adSlot, adSlotList, adNetworkList, AD_TYPES, TYPE_AD_SLOT, NativeAdSlotLibrariesManager, DisplayAdSlotLibrariesManager, AdTagLibrariesManager) {
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
            publisher: !!adSlot ? adSlot.publisher : null,
            adSlot: adSlot
        };

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;

        $scope.publisherList = publisherList;
        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.adTypes = AD_TYPES;

        $scope.adSlotList = adSlotList;
        $scope.adNetworkList = adNetworkList;

        $scope.adTag = adTag || {
            libraryAdTag: {
                html: null,
                adNetwork: null,
                adType: $scope.adTypes.customAd,
                descriptor: null
            },
            position: null,
            active: true
        };

        if(!!$scope.adTag.libraryAdTag.descriptor) {
            if(!$scope.adTag.libraryAdTag.descriptor.imageUrl) {
                $scope.adTag.libraryAdTag.descriptor = null;
            }
        }

        // delete file unnecessary
        if(!$scope.isNew) {
            $scope.disabledCheckPickFromLibrary = adTag.libraryAdTag.visible;

            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adTag.libraryAdTag.visible;

            // get ad tag library
            getAdTagLibrary();

            // set ad tag library
            $scope.libraryAdTag = adTag.libraryAdTag.id;

            if(!adTag.libraryAdTag.visible) {
                delete adTag.libraryAdTag.id;
            }
        }

        $scope.showInputPosition = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? true : false;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.selectAdSlot = selectAdSlot;
        $scope.getAdTagLibrary = getAdTagLibrary;
        $scope.selectAdTagLibrary = selectAdTagLibrary;
        $scope.backToAdTagLibraryList = backToAdTagLibraryList;
        $scope.filterEntityType = filterEntityType;
        $scope.selectPublisher = selectPublisher;
        $scope.filterByPublisher = filterByPublisher;

        function isFormValid() {
            return $scope.adTagForm.$valid;
        }

        function selectAdSlot(adSlot) {
            $scope.showInputPosition = adSlot && adSlot.libType == $scope.adSlotTypes.display ? true : false;
        }

        function filterEntityType(adSlot) {
            if(adSlot.libType != $scope.adSlotTypes.dynamic) {
                return true;
            }

            return false;
        }

        function filterByPublisher(libraryAdTag) {
            if(!$scope.selected.publisher) {
                return false;
            }

            var publisher = !!$scope.selected.publisher.id ? $scope.selected.publisher.id : $scope.selected.publisher;
            if(!publisher || libraryAdTag.adNetwork.publisher.id != publisher) {
                return false;
            }

            return true;
        }

        function getAdTagLibrary() {
            if($scope.pickFromLibrary) {
                AdTagLibrariesManager.getList()
                    .then(function(libraryAdTag) {
                        $scope.adTagLibraryList = libraryAdTag.plain();
                    }
                );

                // disabled form input html when select ad tag library
                return $scope.editorOptions.readOnly = 'nocursor';
            }

            if(!!$scope.adTag) {
                $scope.adTag.libraryAdTag = {
                    html: null,
                    adNetwork: null,
                    adType: $scope.adTypes.customAd,
                    descriptor: null
                }
            }

            // enable form input html when select ad tag library
            return $scope.editorOptions.readOnly = false;
        }

        function selectAdTagLibrary(libraryAdTag) {
            angular.extend($scope.adTag.libraryAdTag, libraryAdTag);
        }

        function selectPublisher() {
            $scope.selected.adSlot = null;
            $scope.adTag.libraryAdTag.adNetwork = null;
        }

        function backToAdTagLibraryList() {
            var state = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? '^.displayList' : '^.nativeList';

            return $state.go(state, {adSlotId: $scope.selected.adSlot.id});
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.adTag.libraryAdTag.adNetwork = $scope.adTag.libraryAdTag.adNetwork.id ? $scope.adTag.libraryAdTag.adNetwork.id : $scope.adTag.libraryAdTag.adNetwork;

            var Manager = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? DisplayAdSlotLibrariesManager : NativeAdSlotLibrariesManager;

            var adTag = angular.copy($scope.adTag);
            var saveAdTag = $scope.isNew ? Manager.one($scope.selected.adSlot.id).post('adtag', adTag) : adTag.patch();
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
                    var state = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? '^.displayList' : '^.nativeList';

                    return $state.go(state, {adSlotId: $scope.selected.adSlot.id});
                }
            )
            ;
        }
    }
})();