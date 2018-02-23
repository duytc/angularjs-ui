(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagForm', LibraryAdTagForm)
    ;

    function LibraryAdTagForm($scope, $filter, Auth, $modal, $translate, whiteList, blackList, AlertService, AdNetworkManager, AdSlotManager, adSlots, sites, NumberConvertUtil, adminUserManager, ServerErrorProcessor, AdNetworkCache, adTag, publisherList, AdTagLibrariesManager, historyStorage, queryBuilderService, AD_TYPES, USER_MODULES, VARIABLE_FOR_AD_TAG, HISTORY_TYPE_PATH) {
        /**
         * sites's selected in rules
         * @type {Array}
         */
        $scope.usedSites = [];
        /**
         * base on rule's profitType then return corresponding profit unit
         * 1 - fixed profit. 2 - profit margin. 3- manual
         * @type {{1: string, 2: string, 3: string}}
         */
        $scope.profitUnit = {
            '1': "$",
            '2': "%",
            '3': ""
        };
        $scope.fieldNameTranslations = {
            adNetwork: 'adNetwork',
            html: 'html'
        };

        $scope.editorOptions = {
            lineWrapping : true,
            indentUnit: 0,
            mode : "htmlmixed"
        };

        $scope.isNew = adTag === null;
        $scope.adTypes = AD_TYPES;
        $scope.formProcessing = false;
        $scope.adNetworkList = [];
        $scope.publisherList = publisherList;

        $scope.siteList = $scope.isAdmin() ? [] : sites;
        $scope.adSlotList = $scope.isAdmin() ? [] : adSlots;

        $scope.adTag = adTag || {
            html: null,
            adNetwork: null,
            adType: $scope.adTypes.customAd,
            descriptor: null,
            expressionDescriptor: {
                groupVal: [],
                groupType: 'AND'
            },
            inBannerDescriptor: {
                timeout: null,
                playerWidth: null,
                playerHeight: null,
                vastTags: [{tag: null}]
            },
            sellPrice: null,
            adSlotPlacementRules: []
        };

        $scope.domainList = {
            blacklist: blackList,
            whitelist: whiteList
        };

        $scope.selected = {
            publisher: !$scope.isNew ? adTag.adNetwork.publisher : null
        };
        if($scope.adTag.sellPrice != null){
            $scope.adTag.sellPrice =  NumberConvertUtil.convertPriceToString($scope.adTag.sellPrice);
        }

        $scope.adTag.adSlotPlacementRules = $scope.adTag.adSlotPlacementRules ? $scope.adTag.adSlotPlacementRules : [];

        if(!!$scope.adTag.descriptor) {
            if(!$scope.adTag.descriptor.imageUrl) {
                $scope.adTag.descriptor = null;
            }
        }

        $scope.sortableOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder'
        };

        if(!$scope.isNew) {
            if(angular.isArray($scope.adTag.expressionDescriptor) || !$scope.adTag.expressionDescriptor) {
                $scope.adTag.expressionDescriptor = {groupVal: [], groupType: 'AND'}
            }

            if($scope.isAdmin()) {
                if(adSlots.length > 0) {
                    $scope.adSlotList = $filter('selectedPublisher')(angular.copy(adSlots), $scope.adTag.adNetwork.publisher);
                }

                if(sites.length > 0) {
                    $scope.siteList = $filter('selectedPublisher')(angular.copy(sites), $scope.adTag.adNetwork.publisher);
                }
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

        $scope.ruleTypes = [
            {key: 1, value: "Fixed Profit"},
            {key: 2, value: "Profit Margin"},
            {key: 3, value: "Manual"}
        ];

        if(!$scope.isAdmin()) {
            searchAdNetworkItem(null, Auth.getSession().id);
        }
        $scope.onChangeEachRuleSites = onChangeEachRuleSites;
        $scope.onClickEachRuleSites = onClickEachRuleSites;
        $scope.getUsedSites = getUsedSites;
        $scope.loadInitRuleSites = loadInitRuleSites;
        // init usedSites
        getUsedSites();

        _updateRule();

        $scope.addMoreAdNetworkItems = addMoreAdNetworkItems;
        $scope.searchAdNetworkItem = searchAdNetworkItem;
        $scope.clickVIewHelpText = clickVIewHelpText;
        $scope.addNewPlacementRule = addNewPlacementRule;
        $scope.initProfitValueLabel = initProfitValueLabel;
        $scope.changeProfitValueLabel = changeProfitValueLabel;
        $scope.changeRequireBuyPrice = changeRequireBuyPrice;
        $scope.returnSellPrice = returnSellPrice;
        $scope.removePlacementRule = removePlacementRule;



        $scope.onSellPriceChange = function onSellPriceChange() {
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                $scope.changeRequireBuyPrice(rule);
            });
        };
        $scope.initRuleSites = function (siteList) {
            return NumberConvertUtil.subtractArray(siteList, $scope.usedSites);
        };

         function getUsedSites() {
            $scope.usedSites = [];
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                for (var index in rule.sites) {
                    var siteId = rule.sites[index];
                    if (siteId.id) {
                        siteId = siteId.id;
                    }
                    if($scope.usedSites.indexOf(siteId) === -1){
                        $scope.usedSites.push(siteId);
                    }
                }
            });
        }

        function freeSiteAddRuleSites(freeSites, rule) {
            if(rule.sites == null || rule.sites.length == 0){
                return freeSites;
            }
           var ruleSites = angular.copy(freeSites);
            angular.forEach(rule.sites , function (site2) {
                var inputId = site2;
                if(site2.id){
                    inputId = site2.id;
                }

                var foundSite = $scope.siteList.find(function(site) {
                    return site.id == inputId;
                });
                ruleSites.push(foundSite);
            });
            ruleSites.sort(NumberConvertUtil.compareById);
            return ruleSites;
        }

        function getFreeSites(allSites, usedSites) {
            var temp = [];
            for (var i in allSites) {
                var exist = false;
                for(var index in usedSites){
                    if(usedSites[index] == allSites[i].id){
                        exist = true;
                        break;
                    }
                }
                if(!exist){
                    temp.push(allSites[i]);
                }
            }
            return temp;
        }

       function onChangeEachRuleSites(currentRule) {
            $scope.getUsedSites();
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                if(rule.id != currentRule.id){
                    var freeSites = getFreeSites($scope.siteList, $scope.usedSites);
                    rule.siteList = angular.copy(freeSiteAddRuleSites(freeSites, rule));
                }
            });
           fillStickForSupply();
           fillStickForAdSlot();
        }


        function onClickEachRuleSites(rule) {
            $scope.getUsedSites();
            var freeSites = getFreeSites($scope.siteList, $scope.usedSites);
            rule.siteList = angular.copy(freeSiteAddRuleSites(freeSites, rule));

            angular.forEach(rule.siteList, function (site) {
                for (var index in rule.sites) {
                    var id = rule.sites[index];
                    if (rule.sites[index].id) {
                        id = rule.sites[index].id;
                    }
                    if (site.id == id) {
                        site['ticked'] = true;
                    }
                }
            });
        }

        function loadInitRuleSites() {
            $scope.getUsedSites();
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                var freeSites = getFreeSites($scope.siteList, $scope.usedSites);
                rule.siteList = angular.copy(freeSiteAddRuleSites(freeSites, rule));
            });
            fillStickForSupply();
        }

        function removePlacementRule(index) {
            $scope.adTag.adSlotPlacementRules.splice(index, 1);
        }

        function returnSellPrice(sellPrice) {
            if(sellPrice.indexOf('.') > -1) {
                return '$' + sellPrice;
            } else {
                var num = Number(sellPrice);
                return $filter('currency')(num)
            }
        }

        function changeRequireBuyPrice(rule, sellPrice) {
            rule['requiredBuyPrice'] = null;
            sellPrice = sellPrice || (!!$scope.adTag ? $scope.adTag.sellPrice : null);

            switch (rule.profitType) {
                case 1:
                    // realProfitValue = sellPrice (from ad tag) - buyPrice (from ad slot)
                    // expect: profitValue <= realProfitValue
                    // => profitValue <= sellPrice (from ad tag) - buyPrice (from ad slot)
                    // => buyPrice (from ad slot) <= sellPrice (from ad tag) - profitValue
                    var requireBuyPriceByFixProfit = rule.profitValue
                        ? parseFloat(sellPrice) - parseFloat(rule.profitValue)
                        : parseFloat(sellPrice);
                    rule.requiredBuyPrice = requireBuyPriceByFixProfit > 0 ? requireBuyPriceByFixProfit : 0;

                    break;
                case 2:
                    // realProfitMargin = [1 - (buyPrice (from ad slot) / sellPrice (from ad tag))] * 100 (%)
                    // expect: profitValue <= realProfitMargin
                    // => profitValue <= [1 - (buyPrice (from ad slot) / sellPrice (from ad tag))] * 100 (%)
                    // => buyPrice (from ad slot) <= sellPrice (from ad tag) * [1 - profitValue / 100]
                    var requireBuyPriceByMarginProfit = rule.profitValue
                        ? parseFloat(sellPrice) * (1 - parseFloat(rule.profitValue) / 100)
                        : parseFloat(sellPrice);
                    rule.requiredBuyPrice = requireBuyPriceByMarginProfit > 0 ? requireBuyPriceByMarginProfit : 0;

                    break;
                default:
                    rule.requiredBuyPrice = parseFloat(sellPrice);
                    break;
            }
        }

        function initProfitValueLabel(rule) {
            switch (rule.profitType) {
                case 1:
                    $scope.profiltValueLabel = 'Profit Value ($)';
                    break;
                case 2:
                    $scope.profiltValueLabel = 'Profit Value (%)';
                    break;
                default:
                    $scope.profiltValueLabel = 'Profit Value';
                    break;
            }

            changeRequireBuyPrice(rule);
        }

        function changeProfitValueLabel($item, rule) {
            switch ($item.key) {
                case 1:
                    $scope.profiltValueLabel = 'Profit Value ($)';
                    break;
                case 2:
                    $scope.profiltValueLabel = 'Profit Value (%)';
                    break;
                default:
                    $scope.profiltValueLabel = 'Profit Value';
                    break;
            }

            rule.profitValue = null;
            changeRequireBuyPrice(rule);
        }

        function addNewPlacementRule() {
            $scope.adTag.adSlotPlacementRules.push({
                siteList: angular.copy($scope.initRuleSites($scope.siteList)),
                adSlotList: angular.copy($scope.adSlotList),
                sites: [],
                adSlots: [],
                profitType: 3,
                profitValue: null,
                position: 1,
                priority: null,
                rotationWeight: null
            });
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
            if(query == sideParams.adNetwork.params.query) {
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

        $scope.builtVariable = function(expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        $scope.isFormValid = function() {
            // validate Ad Slot Placement Rules
            if($scope.adTag.adSlotPlacementRules){
                for (i = 0; i < $scope.adTag.adSlotPlacementRules.length; i++) {
                    var rule = $scope.adTag.adSlotPlacementRules[i];
                    if(null == rule.sites || rule.sites.length == 0){
                        return false;
                    }
                }
            }

            for(var i in $scope.adTag.expressionDescriptor.groupVal) {
                var group = $scope.adTag.expressionDescriptor.groupVal[i];
                if (!_validateGroup(group)) {
                    return false;
                }
            }

            return $scope.adTagLibraryForm.$valid;
        };

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

        $scope.selectPublisher = function(publisher) {
            $scope.adTag.adNetwork = null;
            $scope.adTag.expressionDescriptor = {
                groupVal: [],
                    groupType: 'AND'
            };

            searchAdNetworkItem(null, publisher.id);


            if(adSlots.length > 0) {
                $scope.adSlotList = $filter('selectedPublisher')(angular.copy(adSlots), publisher);
            }

            if(sites.length > 0) {
                $scope.siteList = $filter('selectedPublisher')(angular.copy(sites), publisher);
                //each rule use a list of site
                if($scope.adTag.adSlotPlacementRules){
                    for (var i = 0; i < $scope.adTag.adSlotPlacementRules.length; i++) {
                        var rule = $scope.adTag.adSlotPlacementRules[i];
                        rule.siteList = angular.copy($scope.siteList);
                    }
                }

            }
        };

        $scope.backToAdTagLibraryList = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        };

        $scope.createAdNetwork = function() {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(adminUserManager){
                        if(!$scope.isAdmin()) {
                            return null;
                        }

                        if(!!publisherList) {
                            return publisherList;
                        }

                        return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                            return users.plain();
                        });
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
                    });
            })
        };

        $scope.addVast = function () {
            $scope.adTag.inBannerDescriptor.vastTags.push({
                tag: null
            })
        };

        $scope.removeTag = function (index) {
            if(index > -1) {
                $scope.adTag.inBannerDescriptor.vastTags.splice(index, 1)
            }
        };

        $scope.enableDragDropVastTag = function(enable) {
            $scope.sortableOptions['disabled'] = enable;
        };

        $scope.hasInBanner = function () {
            if($scope.isAdmin() && !$scope.selected.publisher) {
                return false
            } else if($scope.isAdmin() && !!$scope.selected.publisher) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1
            }

            return Auth.getSession().hasModuleEnabled(USER_MODULES.inBanner);
        };

        $scope.moveVastTag = function(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var adTag = angular.copy($scope.adTag);
            _formatGroupVal(adTag.expressionDescriptor.groupVal);
            if(adTag.sellPrice == null || adTag.sellPrice.trim().length == 0){
                adTag.sellPrice = null;
            }else {
                adTag.sellPrice =  NumberConvertUtil.convertPriceToString(adTag.sellPrice);
            }

            angular.forEach(adTag.adSlotPlacementRules, function(rule) {
                delete rule.adSlotList;
                delete rule.siteList;

                var adSlots = [];
                var sites = [];

                angular.forEach(rule.adSlots, function(adSlot) {
                    adSlots.push(adSlot.id)
                });

                angular.forEach(rule.sites, function(site) {
                    sites.push(site.id)
                });

                rule.adSlots = adSlots;
                rule.sites = sites;
            });

            if(adTag.expressionDescriptor.groupVal.length == 0) {
                adTag.expressionDescriptor = {};
                adTag.descriptor = {};
            }

            var saveAdTagLibrary =  $scope.isNew ? AdTagLibrariesManager.post(adTag) : AdTagLibrariesManager.one(adTag.id).patch(adTag);
            saveAdTagLibrary
                .catch(
                function (response) {
                    if(!response.data.errors) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: response.data.message
                        });
                    }

                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagLibraryForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('AD_TAG_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
                })
            ;
        };

        _update();

        function _update() {
            if(!$scope.isNew) {
                _convertGroupVal(adTag.expressionDescriptor.groupVal);
            }
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

        function fillStickForAdSlot() {
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                angular.forEach(rule.adSlotList, function(adSlot) {
                    for(var index in rule.adSlots){
                        var id = rule.adSlots[index];
                        if(rule.adSlots[index].id){
                            id = rule.adSlots[index].id;
                        }
                        if(adSlot.id == id){
                            adSlot['ticked'] = true;
                        }
                    }
                });
            });
        }
        function fillStickForSupply() {
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                angular.forEach(rule.siteList, function(site) {
                    for(var index in rule.sites){
                        var id = rule.sites[index];
                        if(rule.sites[index].id){
                            id = rule.sites[index].id;
                        }
                        if(site.id == id){
                            site['ticked'] = true;
                        }
                    }
                });
            });
        }
        function _setRule() {
            angular.forEach($scope.adTag.adSlotPlacementRules, function(rule) {
                angular.forEach(rule.adSlotList, function(adSlot) {
                    adSlot['ticked'] = rule.adSlots.indexOf(adSlot.id) > -1
                });

                angular.forEach(rule.siteList, function(site) {
                    site['ticked'] = rule.sites.indexOf(site.id) > -1
                });
            });
        }

        function _updateRule() {
            $scope.loadInitRuleSites();
            _updateRuleWhenSelectedSiteChange();
        }

        $scope.$watch(function () {
            return $scope.adTag.adSlotPlacementRules
        }, function (oldAdSlotPlacementRules, newAdSlotPlacementRules) {
            var changed = false;

            angular.forEach(oldAdSlotPlacementRules, function (oldRule, id) {
                var newRule = newAdSlotPlacementRules[id];
                if (!newRule) {
                    return;
                }

                if (oldRule.sites.length != newRule.sites.length) {
                    changed = true;
                }
            });

            if (changed) {
                return _updateRuleWhenSelectedSiteChange()
            }
        }, true);

        function _updateRuleWhenSelectedSiteChange() {
            angular.forEach($scope.adTag.adSlotPlacementRules, function (rule) {
                // build adSlotList due to selected sites
                var siteIds = [];
                angular.forEach(angular.copy(rule.sites), function (site) {
                    if(site.id){
                        siteIds.push(site.id);
                    }else {
                        siteIds.push(site);
                    }
                });

                if (siteIds.length < 1) {
                    rule.adSlotList = [];
                    return;
                }

                return AdSlotManager.getList({siteIds: siteIds.join(',')})
                    .then(function (adSlots) {
                        angular.forEach(adSlots, function (adSlot) {
                            adSlot.name = adSlot.libraryAdSlot.name;
                            adSlot.publisher = adSlot.libraryAdSlot.publisher
                        });

                        rule.adSlotList = adSlots.plain();
                        fillStickForAdSlot();
                    })
            });
        }
    }
})();