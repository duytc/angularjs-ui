(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotForm', LibraryAdSlotForm)
    ;

    function LibraryAdSlotForm($scope, $translate, $stateParams, $filter, _, adSlot, publisherList, adSlotType, VARIABLE_FOR_AD_TAG, TYPE_AD_SLOT, AlertService, adSlotService, ServerErrorProcessor, libraryAdSlotService, AdSlotLibrariesManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = adSlot === null;
        $scope.publisherList = publisherList;

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
                label: $translate.instant('NATIVE_AD_SLOT'),
                key: TYPE_AD_SLOT.native
            },
            {
                label: $translate.instant('DYNAMIC_AD_SLOT'),
                key: TYPE_AD_SLOT.dynamic
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
            passbackMode: $scope.passbackOption[0].key
        };

        $scope.selected = {
            type:  adSlotType || $scope.typesList.display
        };

        $scope.adSlotsDefault = [{id: null, name: 'None'}];
        _update();

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

            var adSlot = _refactorAdSlot($scope.adSlot);

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
                passbackMode: $scope.passbackOption[0].key
            };

            _getAdSlots(type)
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
    }
})();