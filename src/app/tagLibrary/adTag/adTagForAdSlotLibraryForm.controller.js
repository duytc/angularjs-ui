(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('AdTagForAdSlotLibraryForm', AdTagForAdSlotLibraryForm)
    ;

    function AdTagForAdSlotLibraryForm($scope, $modal, _, Auth, $stateParams, $translate, $state, whiteList, blackList, queryBuilderService, AdSlotAdTagLibrariesManager, AlertService, AdNetworkCache, ServerErrorProcessor, AdNetworkManager, adminUserManager, publisherList, adTag, adSlot, NumberConvertUtil, adSlotList, AD_TYPES, TYPE_AD_SLOT, NativeAdSlotLibrariesManager, DisplayAdSlotLibrariesManager, AdTagLibrariesManager, VARIABLE_FOR_AD_TAG, USER_MODULES) {
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

        $scope.sortableOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder'
        };

        $scope.selected = {
            publisher: !!adSlot ? adSlot.publisher : null,
            adSlot: adSlot
        };

        AlertService.addAlertNotRemove({
            type: 'warning',
            message: $translate.instant('AD_TAG_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
        });

        $scope.isNew = adTag === null;
        $scope.formProcessing = false;

        $scope.publisherList = publisherList;
        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.adTypes = AD_TYPES;

        $scope.adSlotList = adSlotList;
        $scope.adNetworkList = [];

        $scope.domainList = {
            blacklist: blackList,
            whitelist: whiteList
        };

        $scope.adTagLibraryList = [];

        $scope.adTagGroup = [];
        $scope.adTag = adTag || {
            libraryAdTag: {
                html: null,
                adNetwork: null,
                adType: $scope.adTypes.customAd,
                descriptor: null,
                expressionDescriptor: {
                    groupVal: [],
                    groupType: 'AND'
                },
                // partnerTagId: null,
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
        };

        if(!!$scope.adTag.libraryAdTag.descriptor) {
            if(!$scope.adTag.libraryAdTag.descriptor.imageUrl) {
                $scope.adTag.libraryAdTag.descriptor = null;
            }
        }

        var adTagLibraryTotalRecord = null;
        var adTagLibraryParams = {
            query: '',
            publisherId: Auth.isAdmin() ? (adSlot.publisher.id || null) : Auth.getSession().id
        };

        // delete file unnecessary
        if(!$scope.isNew) {
            $scope.disabledCheckPickFromLibrary = adTag.libraryAdTag.visible;

            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adTag.libraryAdTag.visible;

            if($scope.pickFromLibrary) {
                $scope.adTagLibraryList.push(adTag.libraryAdTag);
                searchAdTagLibraryItem();
            }

            // get ad tag library
            getAdTagLibrary();

            // set ad tag library
            $scope.libraryAdTag = adTag.libraryAdTag.id;

            if(!adTag.libraryAdTag.visible) {
                delete adTag.libraryAdTag.id;
            }

            if(angular.isArray($scope.adTag.libraryAdTag.expressionDescriptor) || !$scope.adTag.libraryAdTag.expressionDescriptor) {
                $scope.adTag.libraryAdTag.expressionDescriptor = {groupVal: [], groupType: 'AND'}
            }
        }

        _update();

        function _update() {
            if(!$scope.isNew) {
                _convertGroupVal($scope.adTag.libraryAdTag.expressionDescriptor.groupVal);
            }
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

        $scope.showInputPosition = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? true : false;

        if(!$scope.isAdmin()) {
            searchAdNetworkItem(null, Auth.getSession().id);
        }

        $scope.addMoreAdNetworkItems = addMoreAdNetworkItems;
        $scope.searchAdNetworkItem = searchAdNetworkItem;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.selectAdSlot = selectAdSlot;
        $scope.getAdTagLibrary = getAdTagLibrary;
        $scope.selectAdTagLibrary = selectAdTagLibrary;
        $scope.backToAdTagLibraryList = backToAdTagLibraryList;
        $scope.filterEntityType = filterEntityType;
        $scope.selectPublisher = selectPublisher;
        $scope.filterByPublisher = filterByPublisher;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.moveVastTag = moveVastTag;
        $scope.addMoreAdTagLibraryItems = addMoreAdTagLibraryItems;
        $scope.searchAdTagLibraryItem = searchAdTagLibraryItem;
        $scope.clickVIewHelpText = clickVIewHelpText;

        if($scope.adTag.libraryAdTag.sellPrice != null) {
            $scope.adTag.libraryAdTag.sellPrice =  NumberConvertUtil.convertPriceToString($scope.adTag.libraryAdTag.sellPrice);
        }

        function clickVIewHelpText() {
            $modal.open({
                templateUrl: 'videoManagement/IVTPixel/helpTextMacros.tpl.html',
                controller: function ($scope, MACROS_FOR_AD_TAG) {
                    $scope.macrosOptions = MACROS_FOR_AD_TAG;
                }
            });
        }

        function searchAdNetworkItem(query, publisherId) {
            if(query == sideParams.adNetwork.params.query && query != null) {
                return;
            }

            sideParams.adNetwork.params.page = 1;
            sideParams.adNetwork.params.searchKey = query;
            sideParams.adNetwork.params.query = query;

            var publisher = publisherId || (angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher);

            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function(datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;

                    $scope.adNetworkList = [];
                    angular.forEach(datas.records, function(adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                });
        }

        function addMoreAdNetworkItems() {
            var page = Math.ceil((($scope.adNetworkList.length -1)/10) + 1);

            if(($scope.isAdmin() && !$scope.selected.publisher) || sideParams.adNetwork.params.page === page || (page > Math.ceil(sideParams.adNetwork.totalRecord/10) && page != 1)) {
                return
            }

            sideParams.adNetwork.params.page = page;

            var publisher = angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher;
            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function(datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;
                    angular.forEach(datas.records, function(adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                })
        }

        function searchAdTagLibraryItem(query) {
            if(!adTagLibraryParams.publisherId) {
                return;
            }

            adTagLibraryParams.page = 1;
            adTagLibraryParams.searchKey = query;

            AdTagLibrariesManager.one().get(adTagLibraryParams)
                .then(function(data) {
                    $scope.adTagLibraryList = data.records;
                    adTagLibraryTotalRecord = data.totalRecord;
                });
        }

        function addMoreAdTagLibraryItems() {
            var page = Math.ceil(($scope.adTagLibraryList.length/10) + 1);

            if(adTagLibraryParams.page === page || !adTagLibraryParams.publisherId || !adTagLibraryTotalRecord || (page > Math.ceil(adTagLibraryTotalRecord/10) && page != 1)) {
                return
            }

            adTagLibraryParams.page = page;

            AdTagLibrariesManager.one().get(adTagLibraryParams)
                .then(function(data) {
                    angular.forEach(data.records, function(item) {
                        adTagLibraryTotalRecord = data.totalRecord;

                        if(_.findIndex($scope.adTagLibraryList, {id: item.id}) == -1) {
                            $scope.adTagLibraryList.push(item);
                        }
                    })
                });
        }

        function _convertGroupVal(groupVal) {
            angular.forEach(groupVal, function(group) {
                var index = _.findIndex(VARIABLE_FOR_AD_TAG, {key: group.var});

                if(index > -1) {
                    group.customVar = group.var;
                } else {
                    group.customVar = 'CUSTOM';
                }

                if(angular.isString(group.val) && (group.var == '${COUNTRY}' || group.var == '${DEVICE}' || group.var == '${DOMAIN}')) {
                    group.val = group.val.split(',');

                    if(group.var != '${DOMAIN}') {
                        group.cmp = group.cmp == '==' ||  group.cmp == 'is' ? 'is' : 'isNot';
                    }
                }

                if(angular.isObject(group.groupVal)) {
                    _convertGroupVal(group.groupVal);
                }
            });
        }

        function isFormValid() {
            for(var i in $scope.adTag.libraryAdTag.expressionDescriptor.groupVal) {
                var group = $scope.adTag.libraryAdTag.expressionDescriptor.groupVal[i];
                if (!_validateGroup(group)) {
                    return false;
                }
            }

            return $scope.adTagForm.$valid;
        }

        function _validateGroup(group) {
            if(!!group.groupVal && group.groupVal.length > 0) {

                var tmpGroup;
                for(var i in group.groupVal) {
                    tmpGroup = group.groupVal[i];
                    if (!_validateGroup(tmpGroup)) {
                        return false;
                    }
                }

                return true;
            }

            if(group.customVar == '${DOMAIN}' || group.customVar == '${DEVICE}' || group.customVar == '${COUNTRY}') {
                if(!group.val || group.val.length == 0) {
                    return false
                }
            }

            return (!!group.customVar && group.customVar != 'CUSTOM') || !!group.var;
        }

        function moveVastTag(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        }

        $scope.removeTag = function (index) {
            if(index > -1) {
                $scope.adTag.libraryAdTag.inBannerDescriptor.vastTags.splice(index, 1)
            }
        };

        $scope.hasInBanner = function () {
            if($scope.isAdmin() && !$scope.selected.publisher) {
                return false
            } else if($scope.isAdmin() && !!$scope.selected.publisher) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1
            }

            return Auth.getSession().hasModuleEnabled(USER_MODULES.inBanner);
        };

        $scope.addVast = function () {
            $scope.adTag.libraryAdTag.inBannerDescriptor.vastTags.push({
                tag: null
            })
        };

        $scope.builtVariable = function(expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        $scope.enableDragDropVastTag = function(enable) {
            $scope.sortableOptions['disabled'] = enable;
        };

        function selectAdNetwork(adNetwork) {
            $scope.adTag.libraryAdTag.name = adNetwork.name;
        }

        function selectAdSlot(adSlot) {
            $scope.showInputPosition = adSlot && adSlot.libType == $scope.adSlotTypes.display ? true : false;

            if($scope.showInputPosition) {
                _getAdTagGroup(adSlot)
            }
        }

        function _getAdTagGroup(adSlot) {
            if(adSlot.libType == $scope.adSlotTypes.display) {
                DisplayAdSlotLibrariesManager.one(adSlot.id).getList('adtags').then(function (adTags) {
                    $scope.adTagGroup = _setupGroup(adTags.plain());
                });
            }

            //if(adSlot.libType == $scope.adSlotTypes.native) {
            //    NativeAdSlotLibrariesManager.one(adSlot.id).getList('adtags').then(function (adTags) {
            //        $scope.adTagGroup = adTags.plain();
            //    });
            //}
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
                // AdTagLibrariesManager.getList()
                //     .then(function(libraryAdTag) {
                //         $scope.adTagLibraryList = libraryAdTag.plain();
                //     }
                // );

                // disabled form input html when select ad tag library
                // return $scope.editorOptions.readOnly = 'nocursor';

                return;
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
            var libraryAdTagClone = angular.copy(libraryAdTag);

            if(!libraryAdTagClone.expressionDescriptor || !libraryAdTagClone.expressionDescriptor.groupVal ) {
                libraryAdTagClone.expressionDescriptor = {
                    groupVal: [],
                    groupType: 'AND'
                }
            }

            _convertGroupVal(libraryAdTagClone.expressionDescriptor.groupVal);

            angular.extend($scope.adTag.libraryAdTag, libraryAdTagClone);
        }

        function selectPublisher(publisher) {
            $scope.selected.adSlot = null;
            $scope.adTag.libraryAdTag.adNetwork = null;

            $scope.adTag.libraryAdTag.expressionDescriptor = {
                groupVal: [],
                groupType: 'AND'
            };

            adTagLibraryParams.publisherId = publisher.id;

            // changed select publisher -> refresh adNetWork and then get adNetwork for new pub
            searchAdNetworkItem(null, publisher.id);
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
            delete $scope.adTag.libraryAdTag.associatedTagCount; // remove associatedTagCount
            delete $scope.adTag.libraryAdTag.id; // remove associatedTagCount


            var Manager = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? DisplayAdSlotLibrariesManager : NativeAdSlotLibrariesManager;

            var adTag = angular.copy($scope.adTag);
            _formatGroupVal(adTag.libraryAdTag.expressionDescriptor.groupVal);

            if(adTag.libraryAdTag.expressionDescriptor.groupVal.length == 0) {
                adTag.libraryAdTag.expressionDescriptor = null;
            }

            var saveAdTag = $scope.isNew ? Manager.one($scope.selected.adSlot.id).post('adtag', adTag) : AdSlotAdTagLibrariesManager.one(adTag.id).patch(adTag);
            saveAdTag
                .catch(function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.ADD_NEW_SUCCESS')
                    });
                })
                .then(function () {
                    var state = $scope.selected.adSlot && $scope.selected.adSlot.libType == $scope.adSlotTypes.display ? '^.displayList' : '^.nativeList';

                    return $state.go(state, {adSlotId: $scope.selected.adSlot.id});
                }
            )
            ;
        }

        function _formatGroupVal(groupVal) {
            angular.forEach(groupVal, function(group) {
                if(group.customVar != 'CUSTOM') {
                    group.var = group.customVar;
                }

                delete group.customVar;

                if(angular.isObject(group.val)) {
                    group.val = group.val.toString();
                }

                if(angular.isObject(group.groupVal)) {
                    _formatGroupVal(group.groupVal);
                }
            });
        }

        $scope.createAdNetwork = function() {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                resolve: {
                    publishers: function(){
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
                    .then(function(adNetworks) {
                        $scope.adNetworkList = adNetworks;

                        var adNetworkNew = _.max($scope.adNetworkList, function(adNetwork){ return adNetwork.id; });
                        var publisherId = $scope.selected.publisher.id || $scope.selected.publisher;
                        if(adNetworkNew.publisher.id == publisherId || !$scope.isAdmin()) {
                            $scope.adTag.libraryAdTag.adNetwork = adNetworkNew;
                        }

                        // if auth is admin -> filter adNetWork based on publisher has been chosen
                        if ($scope.isAdmin()) {
                            $scope.adNetworkList = [];
                            angular.forEach(adNetworks, function (adNetwork) {
                                if (adNetwork.publisher.id == publisherId) {
                                    $scope.adNetworkList.push(adNetwork);
                                }
                            });
                        }
                    });
            })
        };

        function _findAdSlot(adSlotId) {
            return _.find($scope.adSlotList, function(adSlot)
            {
                return adSlot.id == adSlotId;
            });
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