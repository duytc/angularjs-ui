(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagForm', AdTagForm)
    ;

    function AdTagForm(
        $scope, $state, $stateParams, SiteManager, AdTagManager, AlertService, ServerErrorProcessor, historyStorage, AdTagLibrariesManager, adTag, adSlot, site, publisher, publisherList, siteList, adSlotList, adNetworkList, AD_TYPES, TYPE_AD_SLOT, HISTORY_TYPE_PATH
        ) {
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

        $scope.isNew = adTag === null;
        var adTagCopy = angular.copy(adTag);
        $scope.formProcessing = false;

        // !! converts a variable to a boolean
        // we are saying, if we don't have a predefined ad slot but we have a list of all ad slots, allow the user to choose
        $scope.allowAdSlotSelection = $scope.isNew && !!siteList;

        // required by ui select
        $scope.selected = {
            publisher: publisher,
            site: site
        };

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.showInputPosition = adSlot && adSlot.type == $scope.adSlotTypes.display ? true : false;

        $scope.adTypes = AD_TYPES;

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;
        $scope.adSlotList = adSlotList;
        $scope.adNetworkList = adNetworkList;

        // delete file unnecessary
        if(!$scope.isNew) {
            $scope.disabledCheckPickFromLibrary = adTag.libraryAdTag.visible;

            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adTag.libraryAdTag.visible;

            // get ad tag library
            getAdTagLibrary();

            // set ad tag library
            if(adTag.libraryAdTag.visible) {
                $scope.libraryAdTag = adTag.libraryAdTag.id;
            }

            if(!adTag.libraryAdTag.visible) {
                delete adTag.libraryAdTag.id;
            }
        }

        $scope.adTag = adTag || {
            adSlot: adSlot,
            libraryAdTag: {
                name: null,
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

        if(!$scope.isNew && adTag.libraryAdTag.visible) {
            // disabled form input html when select ad tag library
            $scope.editorOptions.readOnly = 'nocursor';
        }

        $scope.getAdTagLibrary = getAdTagLibrary;

        $scope.backToAdTagList = function() {
            if(!!$stateParams.adSlotType && !!$stateParams.adSlotId) {
                var stateAdTagForAdSlotLibraryList;

                if($stateParams.adSlotType == $scope.adSlotTypes.display) {
                    stateAdTagForAdSlotLibraryList = '^.displayList'
                }
                if($stateParams.adSlotType == $scope.adSlotTypes.native) {
                    stateAdTagForAdSlotLibraryList = '^.nativeList'
                }

                // back to ad tag for ad slot library
                return $state.go(stateAdTagForAdSlotLibraryList, {adSlotId: $stateParams.adSlotId});
            }

            if(!!$stateParams.adNetworkId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTag, '^.listByAdNetwork');
            }

            var state = $scope.adTag.adSlot.type == $scope.adSlotTypes.native ? '^.nativeList' : '^.list';

            return $state.go(state, {adSlotId: $scope.adTag.adSlot.id});
        };

        $scope.filterEntityType = function (adSlot) {
            if(adSlot.type != $scope.adSlotTypes.dynamic) {
                return true;
            }

            return false;
        };

        $scope.selectAdSlot = function(item) {
            if(item.type == $scope.adSlotTypes.display) {
                return $scope.showInputPosition = true;
            }

            return $scope.showInputPosition = false;
        };

        $scope.resetSelection = function () {
            $scope.adTag.adSlot = null;
            $scope.adSlotList = [];
        };

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.selected.site = null;
            $scope.resetSelection();
        };

        /**
         * Decide whether to include this library ad tag in display list or not.
         *
         * @param libraryAdTag
         * @returns {boolean}
         */
        $scope.filterByPublisher = function(libraryAdTag) {
            if(!$scope.isAdmin()) {
                return true;
            }

            if(!$scope.selected.publisher) {
                return false;
            }

            var publisher = !!$scope.selected.publisher.id ? $scope.selected.publisher.id : $scope.selected.publisher;
            if(!publisher || libraryAdTag.adNetwork.publisher.id != publisher) {
                return false;
            }

            return true;
        };

        $scope.selectSite = function (site, siteId) {
            $scope.resetSelection();

            SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                $scope.adSlotList = adSlots.plain();
            });
        };

        $scope.isFormValid = function() {
            return $scope.adTagForm.$valid;
        };

        function getAdTagLibrary() {
            if($scope.pickFromLibrary) {
                AdTagLibrariesManager.getList()
                    .then(function(libraryAdTag) {
                        $scope.adTagLibraryList = libraryAdTag.plain();
                    }
                );

                // disabled form input html when select ad tag library
                return $scope.editorOptions.readOnly = 'nocursor';
            } else {
                if(angular.isObject($scope.adTag)) {
                    $scope.adTag.libraryAdTag = {
                        name: null,
                        html: null,
                        adNetwork: null,
                        adType: $scope.adTypes.customAd,
                        descriptor: null
                    }
                } else {
                    $scope.adTag = {
                        libraryAdTag: {
                            name: null,
                            html: null,
                            adNetwork: null,
                            adType: $scope.adTypes.customAd,
                            descriptor: null
                        }
                    };
                }
            }

            if(!$scope.isNew) {
                angular.extend($scope.adTag.libraryAdTag, adTagCopy.libraryAdTag);
            }

            if(!!$scope.adTag) {
                delete $scope.adTag.libraryAdTag.id;
                delete $scope.adTag.libraryAdTag.visible;
            }

            // enable form input html when select ad tag library
            return $scope.editorOptions.readOnly = false;
        }

        $scope.selectAdTagLibrary = function(libraryAdTag) {
            angular.extend($scope.adTag.libraryAdTag, libraryAdTag);
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.adTag.libraryAdTag.adNetwork = $scope.adTag.libraryAdTag.adNetwork.id ? $scope.adTag.libraryAdTag.adNetwork.id : $scope.adTag.libraryAdTag.adNetwork;

            var adTag = angular.copy($scope.adTag);
            var saveAdTag = $scope.isNew ? AdTagManager.post(adTag) : $scope.adTag.patch();
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
                        if(!!$stateParams.adSlotType && !!$stateParams.adSlotId) {
                            var stateAdTagForAdSlotLibraryList;

                            if($stateParams.adSlotType == $scope.adSlotTypes.display) {
                                stateAdTagForAdSlotLibraryList = '^.displayList'
                            }
                            if($stateParams.adSlotType == $scope.adSlotTypes.native) {
                                stateAdTagForAdSlotLibraryList = '^.nativeList'
                            }

                            // back to ad tag for ad slot library
                            return $state.go(stateAdTagForAdSlotLibraryList, {adSlotId: $stateParams.adSlotId});
                        }

                        if(!!$stateParams.adNetworkId) {
                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTag, '^.listByAdNetwork');
                        }

                        var adSlotId = $scope.adTag.adSlot;

                        if (angular.isObject(adSlotId)) {
                            adSlotId = adSlotId.id;
                        }

                        var state = $scope.showInputPosition ? '^.list' : '^.nativeList';
                        return $state.go(state, {
                            adSlotId: adSlotId
                        });
                    }
                )
            ;
        };
    }
})();