(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $filter, $stateParams, $q, _, historyStorage, SiteManager, adSlotService, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot, HISTORY_TYPE_PATH, TYPE_AD_SLOT, TYPE_AD_SLOT_FOR_LIST) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;

        $scope.typesList = TYPE_AD_SLOT_FOR_LIST;
        $scope.types = TYPE_AD_SLOT;
        $scope.typesSelect = _.values($scope.types);
        $scope.tags = null;

        $scope.formProcessing = false;
        $scope.allowSiteSelection = $scope.isNew && !!siteList;

        $scope.submit = submit;
        $scope.selectPublisher = selectPublisher;
        $scope.selectSite = selectSite;
        $scope.selectType = selectType;
        $scope.isFormValid = isFormValid;
        $scope.backToListAdSlot = backToListAdSlot;
        $scope.showForDisplayAdSlot = showForDisplayAdSlot;
        $scope.showForNativeAdSlot = showForNativeAdSlot;
        $scope.showForDynamicAdSlot = showForDynamicAdSlot;
        $scope.checkNative = checkNative;

        // required by ui select
        $scope.selected = {
            publisher: site && site.publisher,
            type:  $scope.types.adSlot
        };

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;
        $scope.groupEntities = groupEntities;
        $scope.filterEntityType = filterEntityType;

        $scope.adSlot = adSlot || {
            site: $scope.isNew && !!$stateParams.siteId ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            expressions: []
        };

        $scope.adSlotsDefault = [{id: null, name: 'None'}];
        _update();

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function selectSite(siteId) {
            return _getAdSlots(siteId)
        }

        function selectType(type) {
            if(type == $scope.types.dynamicAdSlot && !!$scope.adSlot.site) {
                _getAdSlots($scope.adSlot.site, type);
            }
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
        }

        function isFormValid() {
            if($scope.selected.type != $scope.types.dynamicAdSlot) { // validate static ad slot
                return $scope.adSlotForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.defaultAdSlot && (!$scope.adSlot.expressions || $scope.adSlot.expressions.length < 1)) {
                return $scope.adSlotForm.$valid;
            }

            var validExpression = _validateExpressions($scope.adSlot.expressions);

            return validExpression && $scope.adSlotForm.$valid;
        }

        function backToListAdSlot() {
            if($scope.isAdmin()) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlot.site.id});
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if($scope.selected.type == $scope.types.nativeAdSlot) {
                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
            }

            if($scope.selected.type == $scope.types.dynamicAdSlot) {
                if(!$scope.isNew) {
                    delete $scope.adSlot.native;
                }

                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
            }
            else {
                delete $scope.adSlot.expressions;
                delete $scope.adSlot.defaultAdSlot;
                delete $scope.adSlot.native;
            }

            delete $scope.adSlot.type;
            delete $scope.adSlot.adSlotType;

            var Manager = adSlotService.getManagerForAdSlot($scope.selected);
            var saveAdSlot = $scope.isNew ? Manager.post($scope.adSlot) : Manager.one($scope.adSlot.id).patch($scope.adSlot);

            saveAdSlot
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adSlotForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;
                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad slot has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'An error occurred. The ad slot could not be ' + ($scope.isNew ? 'created' : 'updated')
                        });

                        return $q.reject();
                    }
                )
                .then(
                    function () {
                        if($scope.isAdmin()) {
                            var siteId = $scope.isNew ? $scope.adSlot.site : $scope.adSlot.site.id;

                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: siteId});
                        }

                        var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
                        if(!!historyAdSlot && !!historyAdSlot.siteId) {
                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
                        }

                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
                    }
                )
            ;
        }

        function filterEntityType(adSlot) {
            if(adSlot.id == null || $scope.adSlot.native) {
                return true;
            }
            else if(!$scope.adSlot.native) {
                if(adSlot.type == $scope.typesList.static) {
                    return true;
                }

                return false;
            }

            return false;
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


        function showForDisplayAdSlot()
        {
            return $scope.selected.type == TYPE_AD_SLOT.adSlot;
        }

        function showForDynamicAdSlot()
        {
            return $scope.selected.type == TYPE_AD_SLOT.dynamicAdSlot;
        }

        function showForNativeAdSlot()
        {
            return $scope.selected.type == TYPE_AD_SLOT.nativeAdSlot;
        }


        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function _addNoneOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'None'
            });

            return data;
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

        function _getAdSlots(siteId, type) {
            type = !!type ? type : $scope.selected.type;

            if((!$scope.isNew && $scope.adSlot.type == $scope.typesList.dynamic) || ($scope.isNew && type == $scope.types.dynamicAdSlot)) {
                SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
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
                });
            }
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

        function _update() {
            if(!$scope.isNew) {
                if($scope.adSlot.type == $scope.typesList.dynamic) {
                    $scope.selected.type = $scope.types.dynamicAdSlot;
                    _getAdSlots($scope.adSlot.site.id);
                }
                if($scope.adSlot.type == $scope.typesList.native) {
                    $scope.selected.type = $scope.types.nativeAdSlot;
                }
            }
            if($scope.isNew && !!$stateParams.siteId) {
                if($scope.selected.type == $scope.types.dynamicAdSlot) {
                    _getAdSlots($stateParams.siteId);
                }
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