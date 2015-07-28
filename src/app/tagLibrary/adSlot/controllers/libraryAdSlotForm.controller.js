(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .controller('LibraryAdSlotForm', LibraryAdSlotForm)
    ;

    function LibraryAdSlotForm($scope, $filter, _, adSlot, adSlotType, TYPE_AD_SLOT, AlertService, adSlotService, ServerErrorProcessor, libraryAdSlotService, AdSlotManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = adSlot === null;
        $scope.adSlot = adSlot || {
            referenceName: null,
            expressions: []
        };
        $scope.formProcessing = false;
        $scope.typesList = TYPE_AD_SLOT;

        if(!$scope.isNew) {
            delete $scope.adSlot.deletedAt;
        }

        $scope.adSlotTypeOptions = [
            {
                label: 'Display Ad Slot',
                key: TYPE_AD_SLOT.display
            },
            {
                label: 'Native Ad Slot',
                key: TYPE_AD_SLOT.native
            },
            {
                label: 'Dynamic Ad Slot',
                key: TYPE_AD_SLOT.dynamic
            }
        ];

        $scope.selected = {
            type:  adSlotType || $scope.typesList.display
        };

        $scope.adSlotsDefault = [{ id: null, name: 'None' }];

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;
        $scope.showForDisplayAdSlot = showForDisplayAdSlot;
        $scope.showForNativeAdSlot = showForNativeAdSlot;
        $scope.showForDynamicAdSlot = showForDynamicAdSlot;
        $scope.checkNative = checkNative;
        $scope.selectType = selectType;
        $scope.filterEntityType = filterEntityType;
        $scope.backToAdSlotLibraryList = backToAdSlotLibraryList;

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

            if($scope.selected.type == $scope.typesList.native) {
                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
                delete $scope.adSlot.expressions;
            }

            if($scope.selected.type == $scope.typesList.dynamic) {
                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
            }
            else {
                delete $scope.adSlot.expressions;
                delete $scope.adSlot.defaultAdSlot;
                delete $scope.adSlot.native;
            }

            delete $scope.adSlot.publisher;
            delete $scope.adSlot.libType;
            delete $scope.adSlot.isReferenced;


            var adSlot = angular.copy($scope.adSlot);
            if($scope.selected.type == $scope.typesList.dynamic) {
                if(!$scope.isNew) {
                    delete adSlot.native;
                }
            }

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
                        message: 'The ad slot has been ' + ($scope.isNew ? 'created' : 'updated')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.list');
                })
            ;
        }

        function isFormValid() {
            if($scope.selected.type != $scope.typesList.dynamic) { // validate display ad slot
                return $scope.adSlotLibraryForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.defaultAdSlot && (!$scope.adSlot.expressions || $scope.adSlot.expressions.length < 1)) {
                return $scope.adSlotLibraryForm.$valid;
            }

            var validExpression = _validateExpressions($scope.adSlot.expressions);

            return validExpression && $scope.adSlotLibraryForm.$valid;
        }

        function checkNative() {
            if($scope.adSlot.native) {
                return;
            }

            if(!!$scope.adSlot.defaultAdSlot) {
                var adSlotId = !!$scope.adSlot.defaultAdSlot.id ? $scope.adSlot.defaultAdSlot.id : $scope.adSlot.defaultAdSlot;
                var defaultAdSlot = _findAdSlot(adSlotId);

                if(defaultAdSlot.type == $scope.typesList.native) {
                    $scope.adSlot.defaultAdSlot = null;
                }
            }

            angular.forEach($scope.adSlot.expressions, function(expressionDescriptor) {
                if(!!expressionDescriptor.expectAdSlot) {
                    var adSlotId = !!expressionDescriptor.expectAdSlot.id ? expressionDescriptor.expectAdSlot.id : expressionDescriptor.expectAdSlot;
                    var adSlot = _findAdSlot(adSlotId);

                    if(adSlot.type == $scope.typesList.native) {
                        expressionDescriptor.expectAdSlot = null;
                    }
                }
            });
        }

        function filterEntityType(adSlot) {
            if(adSlot.id == null || $scope.adSlot.native) {
                return true;
            }
            else if(!$scope.adSlot.native) {
                if(adSlot.type == $scope.typesList.display) {
                    return true;
                }

                return false;
            }

            return false;
        }

        function backToAdSlotLibraryList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.list');
        }

        function selectType(type) {
            _getAdSlots(type)
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

            return !!group.var;
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
            if(!!$scope.adSlot.defaultAdSlot) {
                $scope.adSlot.defaultAdSlot = null;
            }

            angular.forEach($scope.adSlot.expressions, function(expressionDescriptor) {
                expressionDescriptor.expectAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        _update();
        function _update() {
            if(!$scope.isNew) {
                if(adSlotType == $scope.typesList.dynamic) {
                    _getAdSlots(adSlotType)
                }
            }
        }

        function _getAdSlots(type) {
            if(type == $scope.typesList.dynamic) {
                AdSlotManager.getList()
                    .then(function(adSlots) {
                        $scope.adSlotsDefault = $filter('filter')(adSlots.plain(), {type: '!'+$scope.typesList.dynamic});
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

                        $scope.tags = adSlotService.getTagsAdSlotDynamic($filter('filter')(adSlots.plain(), {type: $scope.typesList.dynamic}));
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
    }
})();