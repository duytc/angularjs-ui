(function () {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagForm', AdTagForm)
    ;

    function AdTagForm($scope, Auth, _, $state, $modal, $translate, $stateParams, queryBuilderService, NumberConvertUtil, blackList, whiteList, AdSlotManager, AdNetworkCache, AdTagManager, AlertService, AdTagLibrariesManager, userSession, ServerErrorProcessor, DisplayAdSlotManager, historyStorage, adTag, adSlot, site, publisher, publisherList, AdNetworkManager, adminUserManager, AD_TYPES, TYPE_AD_SLOT, USER_MODULES, HISTORY_TYPE_PATH, VARIABLE_FOR_AD_TAG) {
        $scope.fieldNameTranslations = {
            adSlot: 'Ad Slot',
            name: 'Name',
            position: 'Position',
            active: 'Active',
            adType: 'AdType'
        };

        $scope.editorOptions = {
            lineWrapping: true,
            indentUnit: 0,
            mode: "htmlmixed"
        };

        if (_.isObject(adTag)) {
            var adTagActive = angular.copy(adTag.active);
            adTag.active = adTag.active == 1 ? true : false;
        }

        $scope.isNew = adTag === null;
        console.log('adTag: ' + adTag)

        $scope.formProcessing = false;
        $scope.hasMultipleDeployAdSlot = false;

        if ((!!adSlot && !!adSlot.libraryAdSlot && adSlot.libraryAdSlot.visible) || (!$scope.isNew && !!adTag && !!adTag.libraryAdTag && adTag.libraryAdTag.visible)) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_TAG_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        // !! converts a variable to a boolean
        // we are saying, if we don't have a predefined ad slot but we have a list of all ad slots, allow the user to choose
        $scope.allowAdSlotSelection = $scope.isNew;

        // required by ui select
        $scope.selected = {
            publisher: publisher,
            site: site
        };

        var gettingAdTagGroup = false;
        var totalRecord = null;
        var adTagLibraryTotalRecord = null;
        var params = {
            query: '',
            publisherId: $scope.isAdmin() ? (!!$stateParams.adSlotId ? publisher.id : null) || null : userSession.id
        };

        var adTagLibraryParams = {
            query: '',
            publisherId: $scope.isAdmin() ? !!$stateParams.adSlotId ? publisher.id : null : userSession.id
        };

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.showInputPosition = adSlot && adSlot.type == $scope.adSlotTypes.display ? true : false;

        $scope.adTypes = AD_TYPES;

        $scope.publisherList = publisherList;
        $scope.adSlotList = !!$stateParams.adSlotId ? [adSlot] : [];
        $scope.adNetworkList = [];
        $scope.adTagLibraryList = [];
        var adSlotSelecting = !!$stateParams.adSlotId ? [adSlot] : [];

        // delete file unnecessary
        if (!$scope.isNew) {
            $scope.disabledCheckPickFromLibrary = adTag.libraryAdTag.visible;

            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adTag.libraryAdTag.visible;

            if ($scope.pickFromLibrary) {
                $scope.adTagLibraryList.push(adTag.libraryAdTag);
                searchAdTagLibraryItem();
            }

            // set ad tag library
            if (adTag.libraryAdTag.visible) {
                getAdTagLibrary();
                $scope.libraryAdTag = adTag.libraryAdTag.id;
            }

            if (!adTag.libraryAdTag.visible) {
                delete adTag.libraryAdTag.id;
            }
        }

        $scope.adTagGroup = [];
        $scope.adTag = adTag || {
                adSlots: [],
                libraryAdTag: {
                    expressionDescriptor: {
                        groupVal: [],
                        groupType: 'AND'
                    },
                    name: null,
                    html: null,
                    adNetwork: null,
                    adType: $scope.adTypes.customAd,
                    // partnerTagId: null,
                    descriptor: null,
                    inBannerDescriptor: {
                        timeout: null,
                        playerWidth: null,
                        playerHeight: null,
                        vastTags: [{tag: null}]
                    },
                    sellPrice: null
                },
                position: null,
                impressionCap: null,
                networkOpportunityCap: null,
                active: true
                // passback: false
            };

        if (!$scope.isNew) {
            $scope.adTag.libraryAdTag.sellPrice = NumberConvertUtil.convertPriceToString($scope.adTag.libraryAdTag.sellPrice);
        }

        if (!!$scope.adTag.libraryAdTag.descriptor) {
            if (!$scope.adTag.libraryAdTag.descriptor.imageUrl) {
                $scope.adTag.libraryAdTag.descriptor = null;
            }
        }

        if (!!$stateParams.adSlotId) {
            $scope.adTag.adSlots.push(adSlot.id);
        }

        $scope.sortableOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder'
        };

        $scope.domainList = {
            blacklist: blackList,
            whitelist: whiteList
        };

        if (!$scope.isNew) {
            if (angular.isArray($scope.adTag.libraryAdTag.expressionDescriptor) || !$scope.adTag.libraryAdTag.expressionDescriptor) {
                $scope.adTag.libraryAdTag.expressionDescriptor = {groupVal: [], groupType: 'AND'}
            }

            adTagLibraryParams.publisherId = publisher.id || publisher
        }

        var sideParams = {
            adNetwork: {
                totalRecord: 0,
                params: {
                    query: '',
                    page: null
                }
            }
        };

        if (!$scope.isAdmin()) {
            searchAdNetworkItem(null, Auth.getSession().id);
        }

        $scope.addMoreAdNetworkItems = addMoreAdNetworkItems;
        $scope.searchAdNetworkItem = searchAdNetworkItem;
        $scope.getAdTagLibrary = getAdTagLibrary;
        $scope.searchItem = searchItem;
        $scope.addMoreItems = addMoreItems;
        $scope.searchAdTagLibraryItem = searchAdTagLibraryItem;
        $scope.addMoreAdTagLibraryItems = addMoreAdTagLibraryItems;
        $scope.backToAdTagList = backToAdTagList;
        $scope.moveVastTag = moveVastTag;
        $scope.isPassback = isPassback;
        $scope.clickVIewHelpText = clickVIewHelpText;

        function clickVIewHelpText() {
            $modal.open({
                templateUrl: 'videoManagement/IVTPixel/helpTextMacros.tpl.html',
                controller: function ($scope, MACROS_FOR_AD_TAG) {
                    $scope.macrosOptions = MACROS_FOR_AD_TAG;
                }
            });
        }

        function searchAdNetworkItem(query, publisherId) {
            if (query == sideParams.adNetwork.params.query) {
                return;
            }

            sideParams.adNetwork.params.page = 1;
            sideParams.adNetwork.params.searchKey = query;
            sideParams.adNetwork.params.query = query;

            var publisher = publisherId || (angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher);

            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function (datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;

                    $scope.adNetworkList = [];
                    angular.forEach(datas.records, function (adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                });
        }

        function addMoreAdNetworkItems() {
            var page = Math.ceil((($scope.adNetworkList.length - 1) / 10) + 1);

            if (($scope.isAdmin() && !$scope.selected.publisher) || sideParams.adNetwork.params.page === page || (page > Math.ceil(sideParams.adNetwork.totalRecord / 10) && page != 1)) {
                return
            }

            sideParams.adNetwork.params.page = page;

            var publisher = angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher;
            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function (datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;
                    angular.forEach(datas.records, function (adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                })
        }

        function isPassback() {
            if (!$scope.isNew) {
                return $scope.adTag.adSlot.type == $scope.adSlotTypes.display
            }

            if (!$scope.adTag.adSlots || $scope.adTag.adSlots.length == 0) {
                return false
            }

            for (var i in $scope.adTag.adSlots) {
                var adSlot = _.find($scope.adSlotList, {id: $scope.adTag.adSlots[i].id || $scope.adTag.adSlots[i]});

                if (adSlot.type != $scope.adSlotTypes.display) {
                    return false
                }
            }

            return true
        }

        $scope.builtVariable = function (expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        function backToAdTagList() {
            if (!!$stateParams.adSlotType && !!$stateParams.adSlotId) {
                var stateAdTagForAdSlotLibraryList;

                if ($stateParams.adSlotType == $scope.adSlotTypes.display) {
                    stateAdTagForAdSlotLibraryList = '^.displayList'
                }
                if ($stateParams.adSlotType == $scope.adSlotTypes.native) {
                    stateAdTagForAdSlotLibraryList = '^.nativeList'
                }

                // back to ad tag for ad slot library
                return $state.go(stateAdTagForAdSlotLibraryList, {adSlotId: $stateParams.adSlotId});
            }

            if (!!$stateParams.adNetworkId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagAdNetwork, '^.listByAdNetwork');
            }

            if ($scope.hasMultipleDeployAdSlot) {
                return $state.go('^.^.^.tagLibrary.adTag.list');
            }

            var state = !$scope.showInputPosition ? '^.nativeList' : '^.list';
            var adSlotId = !$scope.isNew ? (adSlot.id || adSlot) : ($scope.adTag.adSlots[0].id || $scope.adTag.adSlots[0]);

            return $state.go(state, {adSlotId: adSlotId});
        }

        $scope.filterEntityType = function (adSlot) {
            if (adSlot.type != $scope.adSlotTypes.dynamic) {
                return true;
            }

            return false;
        };

        $scope.selectAdSlot = function (item) {
            adSlotSelecting.push(item);
        };

        $scope.resetSelection = function () {
            $scope.adTag.adSlot = null;
            $scope.adSlotList = [];
        };

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.selected.site = null;
            $scope.adTag.adSlots = [];
            $scope.adTag.libraryAdTag.expressionDescriptor = {
                groupVal: [],
                groupType: 'AND'
            };

            $scope.resetSelection();

            params.publisherId = publisher.id;
            adTagLibraryParams.publisherId = publisher.id;
            searchItem();
        };

        /**
         * Decide whether to include this library ad tag in display list or not.
         *
         * @param libraryAdTag
         * @returns {boolean}
         */
        $scope.filterByPublisher = function (libraryAdTag) {
            if (!$scope.isAdmin()) {
                return true;
            }

            if (!$scope.selected.publisher) {
                return false;
            }

            var publisher = !!$scope.selected.publisher.id ? $scope.selected.publisher.id : $scope.selected.publisher;
            if (!publisher || libraryAdTag.adNetwork.publisher.id != publisher) {
                return false;
            }

            return true;
        };

        $scope.selectAdNetwork = function (adNetwork) {
            $scope.adTag.libraryAdTag.name = adNetwork.name;
        };

        $scope.isFormValid = function () {
            for (var i in $scope.adTag.libraryAdTag.expressionDescriptor.groupVal) {
                var group = $scope.adTag.libraryAdTag.expressionDescriptor.groupVal[i];
                if (!_validateGroup(group)) {
                    return false;
                }
            }

            if ($scope.isNew) {
                return $scope.adTagForm.$valid && $scope.adTag.adSlots.length > 0
            }

            return $scope.adTagForm.$valid;
        };

        function _validateGroup(group) {
            if (!!group.groupVal && group.groupVal.length > 0) {

                var tmpGroup;
                for (var i in group.groupVal) {
                    tmpGroup = group.groupVal[i];
                    if (!_validateGroup(tmpGroup)) {
                        return false;
                    }
                }

                return true;
            }

            if (group.customVar == '${DOMAIN}' || group.customVar == '${DEVICE}' || group.customVar == '${COUNTRY}') {
                if (!group.val || group.val.length == 0) {
                    return false
                }
            }

            return (!!group.customVar && group.customVar != 'CUSTOM') || !!group.var;
        }

        $scope.createAdNetwork = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function () {
                        return publisherList;
                    },
                    blockList: function (DisplayBlackListManager) {
                        return DisplayBlackListManager.getList()
                            .then(function (blockList) {
                                return blockList.plain()
                            });
                    },
                    whiteList: function (DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList()
                            .then(function (whiteList) {
                                return whiteList.plain()
                            });
                    }
                }
            });

            modalInstance.result.then(function () {
                AdNetworkCache.getAllAdNetworks()
                    .then(function (adNetworks) {
                        $scope.adNetworkList = adNetworks;

                        var adNetworkNew = _.max($scope.adNetworkList, function (adNetwork) {
                            return adNetwork.id;
                        });
                        var publisherId = $scope.selected.publisher.id || $scope.selected.publisher;
                        if (adNetworkNew.publisher.id == publisherId || !$scope.isAdmin()) {
                            $scope.adTag.libraryAdTag.adNetwork = adNetworkNew;
                        }
                    });
            })
        };

        function getAdTagLibrary() {
            if ($scope.pickFromLibrary) {
                // AdTagLibrariesManager.getList()
                //     .then(function(libraryAdTag) {
                //         $scope.adTagLibraryList = libraryAdTag.plain();
                //     }
                // );

                // disabled form input html when select ad tag library
                return $scope.editorOptions.readOnly = true;
            } else {
                if (angular.isObject($scope.adTag)) {
                    $scope.adTag.libraryAdTag = {
                        name: null,
                        html: null,
                        adNetwork: null,
                        adType: $scope.adTypes.customAd,
                        descriptor: null,
                        expressionDescriptor: {
                            groupVal: [],
                            groupType: 'AND'
                        }
                    }
                } else {
                    $scope.adTag = {
                        libraryAdTag: {
                            name: null,
                            html: null,
                            adNetwork: null,
                            adType: $scope.adTypes.customAd,
                            descriptor: null,
                            expressionDescriptor: {
                                groupVal: [],
                                groupType: 'AND'
                            }
                        }
                    };
                }
            }

            if (!$scope.isNew) {
                angular.extend($scope.adTag.libraryAdTag, adTagCopy.libraryAdTag);
            }

            if (!!$scope.adTag) {
                delete $scope.adTag.libraryAdTag.id;
                delete $scope.adTag.libraryAdTag.visible;
            }

            // enable form input html when select ad tag library
            return $scope.editorOptions.readOnly = false;
        }

        $scope.selectAdTagLibrary = function (libraryAdTag) {
            var libraryAdTagClone = angular.copy(libraryAdTag);

            if (!libraryAdTagClone.expressionDescriptor || !libraryAdTagClone.expressionDescriptor.groupVal) {
                libraryAdTag.expressionDescriptor = {
                    groupVal: [],
                    groupType: 'AND'
                }
            }

            _convertGroupVal(libraryAdTagClone.expressionDescriptor.groupVal);

            angular.extend($scope.adTag.libraryAdTag, libraryAdTagClone);
        };

        $scope.addVast = function () {
            $scope.adTag.libraryAdTag.inBannerDescriptor.vastTags.push({
                tag: null
            })
        };

        $scope.removeTag = function (index) {
            if (index > -1) {
                $scope.adTag.libraryAdTag.inBannerDescriptor.vastTags.splice(index, 1)
            }
        };

        $scope.enableDragDropVastTag = function (enable) {
            $scope.sortableOptions['disabled'] = enable;
        };

        $scope.hasInBanner = function () {
            if ($scope.isAdmin() && !$scope.selected.publisher) {
                return false
            } else if ($scope.isAdmin() && !!$scope.selected.publisher) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1
            }

            return Auth.getSession().hasModuleEnabled(USER_MODULES.inBanner);
        };

        $scope.submit = function () {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.adTag.libraryAdTag.adNetwork = $scope.adTag.libraryAdTag.adNetwork.id ? $scope.adTag.libraryAdTag.adNetwork.id : $scope.adTag.libraryAdTag.adNetwork;
            delete $scope.adTag.libraryAdTag.associatedTagCount;

            var adTag = angular.copy($scope.adTag);

            _formatGroupVal(adTag.libraryAdTag.expressionDescriptor.groupVal);

            if (adTag.libraryAdTag.expressionDescriptor.length == 0 || adTag.libraryAdTag.expressionDescriptor.groupVal.length == 0) {
                adTag.libraryAdTag.expressionDescriptor = null;
            }

            if ($scope.isNew) {
                adTag.adSlot = adTag.adSlots;
                delete adTag.adSlots;
            }

            if ((adTagActive == -1 || adTagActive == 0) && !adTag.active) {
                adTag.active = adTagActive
            }

            $scope.adTag.buyPrice = NumberConvertUtil.convertPriceToString($scope.adTag.buyPrice);

            var saveAdTag = $scope.isNew ? AdTagManager.post(adTag) : AdTagManager.one(adTag.id).patch(adTag);
            saveAdTag
                .catch(
                    function (response) {
                        if(response.status === 500){
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: $translate.instant('MESSAGE_500')
                            });
                        }else if (!response.data.errors) {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: response.data.message
                            });
                        }

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
                        })
                    }
                )
                .then(
                    function () {
                        backToAdTagList()
                    }
                )
            ;
        };

        function moveVastTag(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        }

        function _findAdSlot(adSlotId) {
            return _.find($scope.adSlotList, function (adSlot) {
                return adSlot.id == adSlotId;
            });
        }

        function _setupGroup(listAdTags) {
            var adTagGroups = [];

            angular.forEach(listAdTags, function (item) {
                var index = 0;

                if (adTagGroups.length == 0) {
                    adTagGroups[index] = [];
                }
                else {
                    var found = false;
                    angular.forEach(adTagGroups, function (group, indexGroup) {
                        if (group[0].position == item.position && !found) {
                            found = true;
                            index = indexGroup;
                        }
                    });

                    if (found == false) {
                        index = adTagGroups.length;
                        adTagGroups[index] = [];
                    }
                }

                adTagGroups[index].push(item);
            });

            return adTagGroups;
        }

        function _getAdTagGroup(adSlot) {
            if (adSlot.type == $scope.adSlotTypes.display && !gettingAdTagGroup) {
                gettingAdTagGroup = true;

                DisplayAdSlotManager.one(adSlot.id).getList('adtags').then(function (adTags) {
                    gettingAdTagGroup = false;
                    $scope.adTagGroup = _setupGroup(adTags.plain());
                });
            }
        }

        function searchItem(query) {
            if (!params.publisherId) {
                return;
            }

            params.page = 1;
            params.query = query;
            params.searchKey = query;
            var listAdSlotsSelectCurrent = angular.copy($scope.adTag.adSlots);

            // set again adSlotList
            $scope.adSlotList = [];
            angular.forEach($scope.adTag.adSlots, function (adSlotId) {
                var adSlot = _.find(adSlotSelecting, function (adSlot) {
                    return adSlot.id == adSlotId;
                });

                if (!!adSlot) {
                    $scope.adSlotList.push(adSlot);
                }
            });

            AdSlotManager.one('reportable').one('publisher', params.publisherId).get(params)
                .then(function (data) {
                    totalRecord = data.totalRecord;

                    angular.forEach(data.records, function (adSlot) {
                        var index = listAdSlotsSelectCurrent.indexOf(adSlot.id);

                        if (index == -1) {
                            $scope.adSlotList.push(adSlot);
                        }
                    })
                });
        }

        function addMoreItems() {
            var page = Math.ceil(($scope.adSlotList.length / 10) + 1);

            if (params.page === page || !params.publisherId || !totalRecord || (page > Math.ceil(totalRecord / 10) && page != 1)) {
                return
            }

            params.page = page;

            AdSlotManager.one('reportable').one('publisher', params.publisherId).get(params)
                .then(function (data) {
                    totalRecord = data.totalRecord;

                    angular.forEach(data.records, function (item) {
                        if (!!$stateParams.adSlotId && $stateParams.adSlotId == item.id || $scope.adTag.adSlots.indexOf(item.id) > -1) {
                            return
                        }

                        $scope.adSlotList.push(item);
                    })
                });
        }

        function searchAdTagLibraryItem(query) {
            if (!adTagLibraryParams.publisherId) {
                return;
            }

            adTagLibraryParams.page = 1;
            adTagLibraryParams.searchKey = query;

            AdTagLibrariesManager.one().get(adTagLibraryParams)
                .then(function (data) {
                    $scope.adTagLibraryList = data.records;
                    adTagLibraryTotalRecord = data.totalRecord;
                });
        }

        function addMoreAdTagLibraryItems() {
            var page = Math.ceil(($scope.adTagLibraryList.length / 10) + 1);

            if (adTagLibraryParams.page === page || !adTagLibraryParams.publisherId || !adTagLibraryTotalRecord || (page > Math.ceil(adTagLibraryTotalRecord / 10) && page != 1)) {
                return
            }

            adTagLibraryParams.page = page;

            AdTagLibrariesManager.one().get(adTagLibraryParams)
                .then(function (data) {
                    angular.forEach(data.records, function (item) {
                        adTagLibraryTotalRecord = data.totalRecord;

                        if (_.findIndex($scope.adTagLibraryList, {id: item.id}) == -1) {
                            $scope.adTagLibraryList.push(item);
                        }
                    })
                });
        }

        _update();

        function _update() {
            if (!$scope.isNew) {
                _convertGroupVal($scope.adTag.libraryAdTag.expressionDescriptor.groupVal);
            }
        }

        function _convertGroupVal(groupVal) {
            angular.forEach(groupVal, function (group) {
                var index = _.findIndex(VARIABLE_FOR_AD_TAG, {key: group.var});

                if (index > -1) {
                    group.customVar = group.var;
                } else {
                    group.customVar = 'CUSTOM';
                }

                if (angular.isString(group.val) && (group.var == '${COUNTRY}' || group.var == '${DEVICE}' || group.var == '${DOMAIN}')) {
                    group.val = group.val.split(',');

                    if (group.var != '${DOMAIN}') {
                        group.cmp = group.cmp == '==' || group.cmp == 'is' ? 'is' : 'isNot';
                    }
                }

                if (angular.isObject(group.groupVal)) {
                    _convertGroupVal(group.groupVal);
                }
            });
        }

        function _formatGroupVal(groupVal) {
            angular.forEach(groupVal, function (group) {
                if (group.customVar != 'CUSTOM') {
                    group.var = group.customVar;
                }

                delete group.customVar;

                if (angular.isObject(group.val)) {
                    group.val = group.val.toString();
                }

                if (angular.isObject(group.groupVal)) {
                    _formatGroupVal(group.groupVal);
                }
            });
        }

        $scope.$watch(function () {
            return $scope.adTag.adSlots
        }, function () {
            if (!$scope.adTag.adSlots) {
                return
            }

            var adSlotsSelect = $scope.adTag.adSlots.length;

            $scope.hasMultipleDeployAdSlot = adSlotsSelect > 1;

            if (adSlotsSelect == 1) {
                var item = _findAdSlot($scope.adTag.adSlots[0]);
                $scope.showInputPosition = item.type == $scope.adSlotTypes.display;

                if ($scope.showInputPosition) {
                    _getAdTagGroup(item)
                }
            }

            var condition = $scope.adSlotList.length - adSlotsSelect;
            if (0 < condition && condition < 7) {
                addMoreItems();
            }
        })
    }
})();