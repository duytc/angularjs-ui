(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $filter, $stateParams, $q, _, DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, historyStorage, SiteManager, adSlotService, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;
        $scope.adSlotTypes = TYPE_AD_SLOT;
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
        $scope.tags = null;

        $scope.formProcessing = false;
        $scope.allowSiteSelection = $scope.isNew && !!siteList;

        // required by ui select
        $scope.selected = {
            publisher: site && site.publisher,
            type:  $scope.adSlotTypes.display,
            adSlotLibrary: null
        };

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;

        $scope.adSlot = adSlot || {
            site: $scope.isNew && !!$stateParams.siteId ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            libraryAdSlot: {
                expressions: []
            }
        };

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
        $scope.getAdSlotLibrary = getAdSlotLibrary;
        $scope.selectAdSlotLibrary = selectAdSlotLibrary;
        $scope.groupEntities = groupEntities;
        $scope.filterEntityType = filterEntityType;

        // delete file unnecessary
        if(!$scope.isNew) {
            // set pickFromLibrary when edit
            $scope.pickFromLibrary = adSlot.libraryAdSlot.visible;

            // get list ad slot library
            getAdSlotLibrary(adSlot.type);

            // set ad slot library
            $scope.selected.adSlotLibrary = adSlot.libraryAdSlot.id;

            delete adSlot.libraryAdSlot.deletedAt;
            delete adSlot.libraryAdSlot.publisher;

            if(!adSlot.libraryAdSlot.visible) {
                delete adSlot.libraryAdSlot.id;
            }
        }

        $scope.adSlotsDefault = [{ id: null, name: 'None' }];
        _update();

        function groupEntities(item) {
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function selectSite(siteId) {
            _getAdSlots(siteId)
        }

        function selectType(type) {
            if(type == $scope.adSlotTypes.dynamic && !!$scope.adSlot.site) {
                _getAdSlots($scope.adSlot.site, type);
            }

            // reload list ad slot library
            $scope.selected.adSlotLibrary = null;
            getAdSlotLibrary(type);
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
        }

        function isFormValid() {
            if($scope.selected.type != $scope.adSlotTypes.dynamic) { // validate dynamic ad slot
                return $scope.adSlotForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.libraryAdSlot.defaultAdSlot && (!$scope.adSlot.libraryAdSlot.expressions || $scope.adSlot.libraryAdSlot.expressions.length < 1)) {
                return $scope.adSlotForm.$valid;
            }

            var validExpression = _validateExpressions($scope.adSlot.libraryAdSlot.expressions);

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

            if($scope.selected.type == $scope.adSlotTypes.native) {
                delete $scope.adSlot.libraryAdSlot.height;
                delete $scope.adSlot.libraryAdSlot.width;
            }

            if($scope.selected.type == $scope.adSlotTypes.dynamic) {
                delete $scope.adSlot.libraryAdSlot.height;
                delete $scope.adSlot.libraryAdSlot.width;

                // transfer of format number
                $scope.adSlot.libraryAdSlot.defaultAdSlot = !!$scope.adSlot.libraryAdSlot.defaultAdSlot && !!$scope.adSlot.libraryAdSlot.defaultAdSlot.id ? $scope.adSlot.libraryAdSlot.defaultAdSlot.id : $scope.adSlot.libraryAdSlot.defaultAdSlot;
            }
            else {
                delete $scope.adSlot.libraryAdSlot.expressions;
                delete $scope.adSlot.libraryAdSlot.defaultAdSlot;
                delete $scope.adSlot.libraryAdSlot.native;
            }

            delete $scope.adSlot.type;
            delete $scope.adSlot.libraryAdSlot.deletedAt;
            delete $scope.adSlot.libraryAdSlot.publisher;
            delete $scope.adSlot.libraryAdSlot.libType;
            delete $scope.adSlot.libraryAdSlot.isReferenced;

            $scope.adSlot.libraryAdSlot.referenceName = $scope.adSlot.name;
            var adSlot = angular.copy($scope.adSlot);

            if($scope.selected.type == $scope.adSlotTypes.dynamic) {
                if(!$scope.isNew) {
                    delete adSlot.libraryAdSlot.native;
                }
            }

            var Manager = adSlotService.getManagerForAdSlot($scope.selected);
            var saveAdSlot = $scope.isNew ? Manager.post(adSlot) : Manager.one(adSlot.id).patch(adSlot);

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
            if(adSlot.id == null || $scope.adSlot.libraryAdSlot.native) {
                return true;
            }
            else if(!$scope.adSlot.libraryAdSlot.native) {
                if(adSlot.type == $scope.adSlotTypes.display) {
                    return true;
                }

                return false;
            }

            return false;
        }

        function checkNative() {
            if($scope.adSlot.libraryAdSlot.native) {
                return;
            }

            if(!!$scope.adSlot.libraryAdSlot.defaultAdSlot) {
                var adSlotId = !!$scope.adSlot.libraryAdSlot.defaultAdSlot.id ? $scope.adSlot.libraryAdSlot.defaultAdSlot.id : $scope.adSlot.libraryAdSlot.defaultAdSlot;
                var defaultAdSlot = _findAdSlot(adSlotId);

                if(defaultAdSlot.type == $scope.adSlotTypes.native) {
                    $scope.adSlot.libraryAdSlot.defaultAdSlot = null;
                }
            }

            angular.forEach($scope.adSlot.libraryAdSlot.expressions, function(expressionDescriptor) {
                if(!!expressionDescriptor.expectAdSlot) {
                    var adSlotId = !!expressionDescriptor.expectAdSlot.id ? expressionDescriptor.expectAdSlot.id : expressionDescriptor.expectAdSlot;
                    var adSlot = _findAdSlot(adSlotId);

                    if(adSlot.type == $scope.adSlotTypes.native) {
                        expressionDescriptor.expectAdSlot = null;
                    }
                }
            });
        }

        function showForDisplayAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.display;
        }

        function showForDynamicAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.dynamic;
        }

        function showForNativeAdSlot() {
            return $scope.selected.type == $scope.adSlotTypes.native;
        }

        function getAdSlotLibrary(type) {
            if($scope.pickFromLibrary) {
                // get ad slot library display
                if(type == $scope.adSlotTypes.display) {
                    DisplayAdSlotLibrariesManager.getList()
                        .then(function(adSlotLibrary) {
                            $scope.adSlotLibraryList = adSlotLibrary.plain();
                        }
                    );
                }

                // get ad slot library native
                if(type == $scope.adSlotTypes.native) {
                    NativeAdSlotLibrariesManager.getList()
                        .then(function(adSlotLibrary) {
                            $scope.adSlotLibraryList = adSlotLibrary.plain();
                        }
                    );
                }

                // get ad slot library dynamic
                if(type == $scope.adSlotTypes.dynamic) {
                    DynamicAdSlotLibrariesManager.getList()
                        .then(function(adSlotLibrary) {
                            $scope.adSlotLibraryList = adSlotLibrary.plain();
                        }
                    );
                }
            }
            else {
                delete $scope.adSlot.libraryAdSlot.id
            }
        }

        function selectAdSlotLibrary(adSlotLibrary) {
            angular.extend($scope.adSlot.libraryAdSlot, adSlotLibrary);

            if(!$scope.adSlot.name) {
                $scope.adSlot.name = adSlotLibrary.referenceName;
            }
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

            if((!$scope.isNew && $scope.adSlot.type == $scope.adSlotTypes.dynamic) || ($scope.isNew && type == $scope.adSlotTypes.dynamic)) {
                SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                    $scope.adSlotsDefault = $filter('filter')(adSlots.plain(), {type: '!'+$scope.adSlotTypes.dynamic});
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

                    $scope.tags = adSlotService.getTagsAdSlotDynamic($filter('filter')(adSlots.plain(), {type: $scope.adSlotTypes.dynamic}));
                });
            }
        }

        function _resetForm() {
            if(!!$scope.adSlot.libraryAdSlot.defaultAdSlot) {
                $scope.adSlot.libraryAdSlot.defaultAdSlot = null;
            }

            angular.forEach($scope.adSlot.libraryAdSlot.expressions, function(expressionDescriptor) {
                expressionDescriptor.expectAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        function _update() {
            if(!$scope.isNew) {
                if($scope.adSlot.type == $scope.adSlotTypes.dynamic) {
                    $scope.selected.type = $scope.adSlotTypes.dynamic;
                    _getAdSlots($scope.adSlot.site.id);
                }
                if($scope.adSlot.type == $scope.adSlotTypes.native) {
                    $scope.selected.type = $scope.adSlotTypes.native;
                }
            }
            if($scope.isNew && !!$stateParams.siteId) {
                if($scope.selected.type == $scope.adSlotTypes.dynamic) {
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