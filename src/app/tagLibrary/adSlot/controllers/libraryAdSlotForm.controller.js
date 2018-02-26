(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotForm', LibraryAdSlotForm)
    ;

    function LibraryAdSlotForm($scope, $translate, whiteList, blackList, $stateParams, $filter, _, adSlot, adNetworks, AdTagLibrariesManager, NumberConvertUtil, publisherList, adSlotType, VARIABLE_FOR_AD_TAG, TYPE_AD_SLOT, AlertService, adSlotService, ServerErrorProcessor, libraryAdSlotService, AdSlotLibrariesManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.showPosition = false;
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = adSlot === null;
        $scope.publisherList = publisherList;

        $scope.adNetworkList = adNetworks;
        $scope.adTagList = []; // will be update later due to selected ad networks

        if(!$scope.isNew) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_SLOT_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        $scope.formProcessing = false;
        $scope.typesList = TYPE_AD_SLOT;
        $scope.adSlotTypeOptions = [
            {
                label: $translate.instant('DISPLAY_AD_SLOT'),
                key: TYPE_AD_SLOT.display
            },
            {
                label: $translate.instant('DYNAMIC_AD_SLOT'),
                key: TYPE_AD_SLOT.dynamic
            },
            {
                label: $translate.instant('NATIVE_AD_SLOT'),
                key: TYPE_AD_SLOT.native
            }
        ];

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

        $scope.adSlot = adSlot || {
            libraryExpressions: [],
            passbackMode: $scope.passbackOption[0].key,
            buyPrice: null,
            adTagPlacementRules: []
        };

        $scope.selected = {
            type:  adSlotType || $scope.typesList.display
        };

        if($scope.adSlot.buyPrice != null){
            $scope.adSlot.buyPrice = NumberConvertUtil.convertPriceToString($scope.adSlot.buyPrice);
        }
        $scope.adSlot.adTagPlacementRules = !$scope.adSlot.adTagPlacementRules ? [] : $scope.adSlot.adTagPlacementRules;

        $scope.originalAdTagPlacementRules = angular.copy($scope.adSlot.adTagPlacementRules);

        $scope.profiltValueLabel = 'Profit Value';

        $scope.ruleTypes = [
            {key: 1, value: "Fixed Profit"},
            {key: 2, value: "Profit Margin"},
            {key: 3, value: "Manual"}
        ];

        $scope.blacklists = blackList;
        $scope.whitelists = whiteList;

        $scope.adSlotsDefault = [{id: null, name: 'None'}];
        _update();

        _updateRule();

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;
        $scope.showForDisplayAdSlot = showForDisplayAdSlot;
        $scope.showForNativeAdSlot = showForNativeAdSlot;
        $scope.showForDynamicAdSlot = showForDynamicAdSlot;
        $scope.checkNative = checkNative;
        $scope.selectType = selectType;
        $scope.filterEntityType = filterEntityType;
        $scope.backToAdSlotLibraryList = backToAdSlotLibraryList;
        $scope.findTypeLabel = findTypeLabel;
        $scope.selectPublisher = selectPublisher;
        $scope.addNewPlacementRule = addNewPlacementRule;
        $scope.initProfitValueLabel = initProfitValueLabel;
        $scope.changeProfitValueLabel = changeProfitValueLabel;
        $scope.changeRequireSellPrice = changeRequireSellPrice;
        $scope.returnBuyPrice = returnBuyPrice;
        $scope.updateMinimumRequireSellPrice = updateMinimumRequireSellPrice;
        $scope.removePlacementRule = removePlacementRule;

        updateShowPosition();

        function updateShowPosition() {
            $scope.showPosition = $scope.selected.type != TYPE_AD_SLOT.native;
        }

        function selectPublisher(publisher) {
            $scope.adSlot.libraryExpressions = [];

            // update ad tag placement rule
            $scope.adNetworkList = adminUserManager.one(publisher.id).one('adnetworks').getList()
                .then(function (adNetworks) {
                    return adNetworks.plain()
                });

            _updateRule();
        }

        function returnBuyPrice(buyPrice) {
            if (buyPrice.indexOf('.') > -1) {
                return '$' + buyPrice;
            } else {
                var num = Number(buyPrice);
                return $filter('currency')(num)
            }
        }

        function updateMinimumRequireSellPrice() {
            if($scope.adSlot.adTagPlacementRules.length > 0) {
                angular.forEach($scope.adSlot.adTagPlacementRules, function(adTagPlacementRule) {
                    if(!$scope.adSlot.buyPrice) {
                        adTagPlacementRule.profitType = 3
                    }

                    changeRequireSellPrice(adTagPlacementRule);
                });
            }
        }

        function changeRequireSellPrice(rule, buyPrice) {
            rule.requiredSellPrice = null;
            buyPrice = buyPrice || (!!$scope.adSlot ? $scope.adSlot.buyPrice : null);

            switch (rule.profitType) {
                case 1:
                    // realProfitValue = sellPrice (from ad tag) - buyPrice (from ad slot)
                    // expect: profitValue <= realProfitValue
                    // => profitValue <= sellPrice (from ad tag) - buyPrice (from ad slot)
                    // => sellPrice (from ad tag) >= buyPrice (from ad slot) + profitValue
                    var requireSellPriceByFixProfit = rule.profitValue
                        ? parseFloat(buyPrice) + parseFloat(rule.profitValue)
                        : parseFloat(buyPrice);
                    rule.requiredSellPrice = requireSellPriceByFixProfit > 0 ? requireSellPriceByFixProfit : 0;

                    break;
                case 2:
                    // realProfitMargin = [1 - (buyPrice (from ad slot) / sellPrice (from ad tag))] * 100 (%)
                    // expect: profitValue <= realProfitMargin
                    // => profitValue <= [1 - (buyPrice (from ad slot) / sellPrice (from ad tag))] * 100 (%)
                    // => sellPrice (from ad tag) >= buyPrice (from ad slot) / [1 - profitValue / 100]
                    var requireSellPriceByMarginProfit = rule.profitValue
                        ? parseFloat(buyPrice) / (1 - parseFloat(rule.profitValue) / 100)
                        : parseFloat(buyPrice);
                    rule.requiredSellPrice = requireSellPriceByMarginProfit > 0 ? requireSellPriceByMarginProfit : 0;

                    break;
                default:
                    rule.requiredSellPrice = parseFloat(buyPrice);
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

            changeRequireSellPrice(rule);
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
            changeRequireSellPrice(rule);
        }

        function addNewPlacementRule() {
            var newAdTagPlacementRule = {
                adNetworkList: angular.copy($scope.adNetworkList),
                adTagList: angular.copy($scope.adTagList),
                adNetworks: [],
                adTags: [],
                profitType: 3,
                profitValue: null,
                position: null,
                priority: null,
                rotationWeight: null,
                active: true
            };

            $scope.adSlot.adTagPlacementRules.push(newAdTagPlacementRule);
            $scope.originalAdTagPlacementRules.push(newAdTagPlacementRule);
        }

        function removePlacementRule(index) {
            $scope.adSlot.adTagPlacementRules.splice(index, 1);

            if ($scope.originalAdTagPlacementRules[index]) {
                $scope.originalAdTagPlacementRules[index]._delete = true;
            }
        }

        function showForDisplayAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.display;
        }

        function showForDynamicAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.dynamic;
        }

        function showForNativeAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.native;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var adSlot = angular.copy($scope.adSlot);
            adSlot.adTagPlacementRules = $scope.originalAdTagPlacementRules;

            adSlot = _refactorAdSlot(adSlot);

            angular.forEach(adSlot.adTagPlacementRules, function (rule) {
                delete rule.adNetworkList;
                delete rule.adTagList;

                var adNetworks = [];

                angular.forEach(rule.adNetworks, function (adNetwork) {
                    adNetworks.push(adNetwork.id)
                });

                rule.adNetworks = adNetworks;

                var adTags = [];

                angular.forEach(rule.adTags, function (adTag) {
                    adTags.push(adTag.id)
                });

                rule.adTags = adTags;
            });

            var Manager = libraryAdSlotService.getManagerForAdSlotLibrary($scope.selected);
            var saveAdSlot = $scope.isNew ? Manager.post(adSlot) : Manager.one(adSlot.id).patch(adSlot);
            saveAdSlot
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adSlotLibraryForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;
                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('AD_SLOT_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_SLOT_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return backToAdSlotLibraryList();
                })
            ;
        }

        function isFormValid() {
            if($scope.selected.type != $scope.typesList.dynamic) { // validate display ad slot
                return $scope.adSlotLibraryForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.defaultLibraryAdSlot && (!$scope.adSlot.libraryExpressions || $scope.adSlot.libraryExpressions.length < 1)) {
                return $scope.adSlotLibraryForm.$valid;
            }

            var validExpression = _validateExpressions($scope.adSlot.libraryExpressions);

            return validExpression && $scope.adSlotLibraryForm.$valid;
        }

        function checkNative() {
            if($scope.adSlot.native) {
                return;
            }

            if(!!$scope.adSlot.defaultLibraryAdSlot) {
                var adSlotId = !!$scope.adSlot.defaultLibraryAdSlot.id ? $scope.adSlot.defaultLibraryAdSlot.id : $scope.adSlot.defaultLibraryAdSlot;
                var defaultLibraryAdSlot = _findAdSlot(adSlotId);

                if(defaultLibraryAdSlot.libType == $scope.typesList.native) {
                    $scope.adSlot.defaultLibraryAdSlot = null;
                }
            }

            angular.forEach($scope.adSlot.libraryExpressions, function(expressionDescriptor) {
                if(!!expressionDescriptor.expectLibraryAdSlot) {
                    var adSlotId = !!expressionDescriptor.expectLibraryAdSlot.id ? expressionDescriptor.expectLibraryAdSlot.id : expressionDescriptor.expectLibraryAdSlot;
                    var adSlot = _findAdSlot(adSlotId);

                    if(adSlot.libType == $scope.typesList.native) {
                        expressionDescriptor.expectLibraryAdSlot = null;
                        expressionDescriptor.expectlibraryAdSlot = null;
                    }
                }
            });
        }

        function filterEntityType(adSlot) {
            if(adSlot.id == null || $scope.adSlot.native) {
                return true;
            }
            else if(!$scope.adSlot.native) {
                if(adSlot.libType == $scope.typesList.display) {
                    return true;
                }

                return false;
            }

            return false;
        }

        function backToAdSlotLibraryList() {
            if($stateParams.from == 'channel') {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.^.tagManagement.adSlot.listByChannel');
            }

            if($stateParams.from == 'site') {
                var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
                if(!!historyAdSlot && !!historyAdSlot.siteId) {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.^.tagManagement.adSlot.list');
                }

                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.^.tagManagement.adSlot.listAll');
            }

            if($stateParams.from == 'smartAdSlot') {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.ronAdSlot, '^.^.^.tagManagement.ronAdSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.list');
        }

        function selectType(type) {
            $scope.adSlot = {
                libraryExpressions: [],
                passbackMode: $scope.passbackOption[0].key,
                buyPrice: null,
                adTagPlacementRules: []
            };

            _getAdSlots(type)
            updateShowPosition();
        }

        function findTypeLabel(type) {
            return _.find($scope.adSlotTypeOptions, function(typeOption)
            {
                return typeOption.key == type;
            });
        }

        function _validateExpressions(expressions) {

            if (!expressions || expressions.length < 1) {
                return false;
            }

            var expression;
            for(var i in expressions) {
                expression = expressions[i];
                if (!_validateSingleExpression(expression)) {

                    return false;
                }
            }

            return true;
        }

        function _validateSingleExpression(expression) {
            delete expression.libraryDynamicAdSlot;
            delete expression.id;
            delete expression.expressions;

            if(!expression.expressionDescriptor.groupVal || expression.expressionDescriptor.groupVal.length < 1) {
                return false;
            }

            var group;
            for(var i in expression.expressionDescriptor.groupVal) {
                group = expression.expressionDescriptor.groupVal[i];
                if (!_validateGroup(group)) {
                    return false;
                }
            }

            return true;
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

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function _addNoneOption(data, label) {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'None'
            });

            return data;
        }

        function _resetForm() {
            if(!!$scope.adSlot.defaultLibraryAdSlot) {
                $scope.adSlot.defaultLibraryAdSlot = null;
            }

            angular.forEach($scope.adSlot.expressions, function(expressionDescriptor) {
                expressionDescriptor.expectAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        function _update() {
            if(!$scope.isNew) {
                if(adSlotType == $scope.typesList.dynamic) {
                    angular.forEach(adSlot.libraryExpressions, function(libraryExpression) {
                        _convertGroupVal(libraryExpression.expressionDescriptor.groupVal);
                    });

                    _getAdSlots(adSlotType)
                }
            }
        }

        function _getAdSlots(type) {
            if(type == $scope.typesList.dynamic) {
                AdSlotLibrariesManager.getList()
                    .then(function(adSlots) {
                        $scope.adSlotsDefault = $filter('filter')(adSlots.plain(), {libType: '!'+$scope.typesList.dynamic});
                        $scope.adSlots = angular.copy($scope.adSlotsDefault);

                        _addNoneOption($scope.adSlotsDefault, 'None');

                        if(!$scope.isNew) {
                            angular.forEach($scope.adSlots, function(adSlot, index) {
                                if(adSlot.id == $scope.adSlot.id) {
                                    $scope.adSlots.splice(index, 1);
                                }
                            });
                        }

                        if($scope.isNew) {
                            _resetForm();
                        }

                        $scope.tags = adSlotService.getTagsAdSlotDynamic($filter('filter')(adSlots.plain(), {libType: $scope.typesList.dynamic}));
                    }
                );
            }
        }

        function _findAdSlot(adSlotId) {
            return _.find($scope.adSlotsDefault, function(adSlot)
            {
                return adSlot.id == adSlotId;
            });
        }

        /**
         * remove unused fields and refactor object
         * @param adSlot
         * @returns {*}
         * @private
         */
        function _refactorAdSlot(adSlot) {
            adSlot = angular.copy(adSlot);

            if($scope.selected.type == $scope.typesList.native) {
                delete adSlot.height;
                delete adSlot.width;
                delete adSlot.libraryExpressions;
                delete adSlot.autoFit;
                delete adSlot.passbackMode;
            }

            if($scope.selected.type == $scope.typesList.dynamic) {
                delete adSlot.height;
                delete adSlot.width;
                delete adSlot.autoFit;
                delete adSlot.passbackMode;
                delete adSlot.buyPrice;
                delete adSlot.adTagPlacementRules;

                angular.forEach(adSlot.libraryExpressions, function(libraryExpression) {
                    delete libraryExpression.openStatus;
                    _formatGroupVal(libraryExpression.expressionDescriptor.groupVal);
                });
            }
            else {
                delete adSlot.libraryExpressions;
                delete adSlot.defaultLibraryAdSlot;
                delete adSlot.native;
            }

            if(!$scope.isAdmin()) {
                delete adSlot.publisher;
            }

            delete adSlot.libType;
            delete adSlot.isRonAdSlot;

            if($scope.selected.type == $scope.typesList.dynamic) {
                if(!$scope.isNew) {
                    delete adSlot.native;
                }
            }

            return adSlot;
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

        function _setRule() {
            angular.forEach($scope.adSlot.adTagPlacementRules, function (rule) {
                angular.forEach(rule.adNetworkList, function (adNetwork) {
                    adNetwork['ticked'] = rule.adNetworks.indexOf(adNetwork.id) > -1
                });

                var ruleAdTags = rule.adTags;
                _getAdTagsByAdNetworkList(rule.adNetworks)
                    .then(function (adTags) {
                        rule.adTagList = adTags;

                        // DON KNOW why rule.adTags here not work. So that must use ruleAdTags instead. TODO: find out why...

                        angular.forEach(rule.adTagList, function (adTag) {
                            adTag['ticked'] = ruleAdTags.indexOf(adTag.id) > -1
                        });
                    });
            });
        }

        function _updateRule() {
            if (!$scope.isNew) {
                if ($scope.isAdmin()) {
                    if (adNetworks.length > 0) {
                        $scope.adNetworkList = $filter('selectedPublisher')(angular.copy(adNetworks), $scope.adSlot.publisher);
                    }
                }
            }

            angular.forEach($scope.adSlot.adTagPlacementRules, function (rule) {
                rule.adNetworkList = angular.copy($scope.adNetworkList);
                rule.adTagList = []; // will be update later
            });

            _setRule();
        }

        function _getAdTagsByAdNetworkList(adNetworkIds) {
            return AdTagLibrariesManager.getList({adNetworkIds: adNetworkIds.join(',')})
                .then(function (adTags) {
                    angular.forEach(adTags, function (adTag) {
                        adTag.publisher = adTag.adNetwork.publisher
                    });

                    return adTags.plain();
                })
        }

        $scope.$watch(function () {
            return $scope.adSlot.adTagPlacementRules
        }, function (oldAdTagPlacementRules, newAdTagPlacementRules) {
            var changedIds = [];

            angular.forEach(oldAdTagPlacementRules, function (oldRule, id) {
                var newRule = newAdTagPlacementRules[id];
                if (!newRule) {
                    return;
                }

                if (!oldRule.adNetworks || !newRule.adNetworks || oldRule.adNetworks.length != newRule.adNetworks.length) {
                    changedIds.push(id);
                }
            });

            if (changedIds.length > 0) {
                return _updateRuleWhenSelectedAdNetworksChange(changedIds)
            }
        }, true);

        function _updateRuleWhenSelectedAdNetworksChange(changedIds) {
            angular.forEach($scope.adSlot.adTagPlacementRules, function (rule, id) {
                if (changedIds.indexOf(id) < 0) {
                    return;
                }

                // build adTagList due to selected ad networks
                var adNetworkIds = [];
                angular.forEach(angular.copy(rule.adNetworks), function (adNetwork) {
                    adNetworkIds.push(adNetwork.id);
                });

                return AdTagLibrariesManager.getList({adNetworkIds: adNetworkIds.join(',')})
                    .then(function (adTags) {
                        angular.forEach(adTags, function (adTag) {
                            adTag.publisher = adTag.adNetwork.publisher
                        });

                        rule.adTagList = adTags.plain()
                    })
            });
        }
    }
})();