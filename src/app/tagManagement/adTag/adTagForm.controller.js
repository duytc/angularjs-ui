(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagForm', AdTagForm)
    ;

    function AdTagForm($scope, _, $state, $modal, $translate, $stateParams, SiteManager, AdNetworkCache, AdTagManager, AlertService, ServerErrorProcessor, DisplayAdSlotManager, NativeAdSlotManager, historyStorage, adTag, adSlot, site, publisher, publisherList, siteList, adSlotList, adNetworkList, AD_TYPES, TYPE_AD_SLOT, HISTORY_TYPE_PATH) {
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
            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adTag.libraryAdTag.visible;

            // set ad tag library
            if(adTag.libraryAdTag.visible) {
                $scope.libraryAdTag = adTag.libraryAdTag.id;
            }

            if(!adTag.libraryAdTag.visible) {
                delete adTag.libraryAdTag.id;
            }
        }

        $scope.adTagGroup = [];
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
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagAdNetwork, '^.listByAdNetwork');
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
            $scope.showInputPosition = item.type == $scope.adSlotTypes.display;

            if($scope.showInputPosition) {
                _getAdTagGroup(item)
            }
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

        $scope.createAdNetwork = function() {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                resolve: {
                    publishers: function(){
                        return publisherList;
                    }
                }
            });

            modalInstance.result.then(function () {
                AdNetworkCache.getAllAdNetworks()
                    .then(function(adNetworks) {
                        $scope.adNetworkList = adNetworks;
                    });
            })
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
                            message: $scope.isNew ? $translate.instant('AD_TAG_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
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
                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagAdNetwork, '^.listByAdNetwork');
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

        function _findAdSlot(adSlotId) {
            return _.find($scope.adSlotList, function(adSlot)
            {
                return adSlot.id == adSlotId;
            });
        }

        function _setupGroup(listAdTags) {
            var adTagGroups = [];

            angular.forEach(listAdTags, function(item) {
                var index = 0;

                if(adTagGroups.length == 0) {
                    adTagGroups[index] = [];
                }
                else {
                    var found = false;
                    angular.forEach(adTagGroups, function(group, indexGroup) {
                        if(group[0].position == item.position && !found) {
                            found = true;
                            index = indexGroup;
                        }
                    });

                    if(found == false) {
                        index = adTagGroups.length;
                        adTagGroups[index] = [];
                    }
                }

                adTagGroups[index].push(item);
            });

            return adTagGroups;
        }

        function _getAdTagGroup(adSlot) {
            if(adSlot.type == $scope.adSlotTypes.display) {
                DisplayAdSlotManager.one(adSlot.id).getList('adtags').then(function (adTags) {
                    $scope.adTagGroup = _setupGroup(adTags.plain());
                });
            }

            if(adSlot.type == $scope.adSlotTypes.native) {
                NativeAdSlotManager.one(adSlot.id).getList('adtags').then(function (adTags) {
                    $scope.adTagGroup = adTags.plain();
                });
            }
        }

        update();

        function update() {
            if(!!$stateParams.adSlotId) {
                var adSlot = _findAdSlot($stateParams.adSlotId);

                _getAdTagGroup(adSlot);
            }
        }
    }
})();