(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $filter, $stateParams, $q, _, AdSlotLibrariesManager, DynamicAdSlotManager, historyStorage, SiteManager, adSlotService, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot, HISTORY_TYPE_PATH, TYPE_AD_SLOT) {
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
            defaultAdSlot: null,
            site: $scope.isNew && !!$stateParams.siteId ? parseInt($stateParams.siteId, 10) : null,
            libraryAdSlot: {
                name: null,
                libraryExpressions: []
            }
        };
        var adSlotCopy = angular.copy(adSlot);

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
        $scope.selectDefaultAdSlot = selectDefaultAdSlot;

        $scope.adSlotsDefault = [{id: null, libraryAdSlot: {
            name: 'None'
        }}];
        _update();

        function groupEntities(item) {
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function selectSite(siteId) {
            _resetForm();

            // get again ad slot library when choose site
            getAdSlotLibrary(siteId);
        }

        function selectType(type) {
            _resetForm();

            if(type == $scope.adSlotTypes.dynamic) {
                _getAdSlots($scope.adSlot.site, type);
            }
        }

        function selectDefaultAdSlot(adSlot) {
            if(adSlot.libraryAdSlot) {
                $scope.adSlot.libraryAdSlot.defaultLibraryAdSlot = adSlot.libraryAdSlot.id;
            }
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
        }

        function isFormValid() {
            if($scope.selected.type != $scope.adSlotTypes.dynamic) { // validate dynamic ad slot
                return $scope.adSlotForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.defaultAdSlot && (!$scope.adSlot.libraryAdSlot.libraryExpressions || $scope.adSlot.libraryAdSlot.libraryExpressions.length < 1)) {
                return $scope.adSlotForm.$valid;
            }

            var validExpression = _validateExpressions($scope.adSlot.libraryAdSlot.libraryExpressions);

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

            var adSlot = _refactorAdSlot($scope.adSlot);
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

            if(!!$scope.adSlot.defaultAdSlot) {
                var adSlotId = !!$scope.adSlot.defaultAdSlot.id ? $scope.adSlot.defaultAdSlot.id : $scope.adSlot.defaultAdSlot;
                var defaultAdSlot = _findAdSlot(adSlotId);

                if(defaultAdSlot.type == $scope.adSlotTypes.native) {
                    $scope.adSlot.defaultAdSlot = null;
                }
            }

            angular.forEach($scope.adSlot.libraryAdSlot.libraryExpressions, function(expressionDescriptor) {
                if(!!expressionDescriptor.expressions[0].expectAdSlot) {
                    var adSlotId = !!expressionDescriptor.expressions[0].expectAdSlot.id ? expressionDescriptor.expressions[0].expectAdSlot.id : expressionDescriptor.expressions[0].expectAdSlot;
                    var adSlot = _findAdSlot(adSlotId);

                    if(adSlot.type == $scope.adSlotTypes.native) {
                        expressionDescriptor.expressions[0].expectAdSlot = null;
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

        function getAdSlotLibrary(site) {
            if(!site) {
                return;
            }

            // get list adSlot library for site
            var siteId = site.id || site;
            if($scope.pickFromLibrary) {
                AdSlotLibrariesManager.one('unreferred').one('site', siteId).getList()
                    .then(function(adSlotLibrary) {
                        $scope.adSlotLibraryList = adSlotLibrary.plain();

                        // merge library adSlot when edit ad slot
                        if(!$scope.isNew && $scope.adSlot.libraryAdSlot.visible) {
                            $scope.adSlotLibraryList.push($scope.adSlot.libraryAdSlot);
                        }
                    }
                );
            } else {
                //reset form ad slot when un-check form library

                _resetForm();
                if(!$scope.isNew) {
                    angular.extend($scope.adSlot, adSlotCopy);
                }

                delete $scope.adSlot.expressions;

                // get adSlot list
                if(!!siteId) {
                    _getAdSlots(siteId);
                }
            }
        }

        function selectAdSlotLibrary(adSlotLibrary) {
            if($scope.selected.type == $scope.adSlotTypes.dynamic) {
                return _setLibraryAdSLot(adSlotLibrary)
            }

            _resetForm();
            angular.extend($scope.adSlot.libraryAdSlot, adSlotLibrary);
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
                libraryAdSlot: {
                    name: label || 'None'
                }
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
            if($scope.pickFromLibrary) {
                return;
            }

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
                        _resetFormForDynamic();
                    }

                    $scope.tags = adSlotService.getTagsAdSlotDynamic($filter('filter')(adSlots.plain(), {type: $scope.adSlotTypes.dynamic}));
                });
            }
        }

        function _resetForm() {
            if(!$scope.pickFromLibrary) {
                $scope.selected.adSlotLibrary = null;
            }

            //reset form ad slot when un-check form library
            $scope.adSlot.libraryAdSlot = {
                name: null,
                libraryExpressions: []
            };
            $scope.adSlot.defaultAdSlot = null;
        }

        function _resetFormForDynamic() {
            if(!!$scope.adSlot.defaultAdSlot) {
                $scope.adSlot.defaultAdSlot = null;
            }

            angular.forEach($scope.adSlot.libraryAdSlot.libraryExpressions, function(expressionDescriptor) {
                expressionDescriptor.expectLibraryAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        function _update() {
            if(!$scope.isNew) {
                $scope.disabledCheckPickFromLibrary = $scope.adSlot.libraryAdSlot.visible;

                // set pickFromLibrary when edit
                $scope.pickFromLibrary = $scope.adSlot.libraryAdSlot.visible;

                // get list ad slot library
                getAdSlotLibrary($scope.adSlot.site);

                // set ad slot library
                if($scope.adSlot.libraryAdSlot.visible) {
                    $scope.selected.adSlotLibrary = $scope.adSlot.libraryAdSlot.id;
                }

                if($scope.adSlot.type == $scope.adSlotTypes.dynamic) {
                    $scope.selected.type = $scope.adSlotTypes.dynamic;
                    _getAdSlots($scope.adSlot.site.id);

                    if($scope.pickFromLibrary) {
                        _setExpressions($scope.adSlot)
                    }
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

        /**
         * remove unused fields and refactor object
         * @param adSlot
         * @returns {*}
         * @private
         */
        function _refactorAdSlot(adSlot) {
            adSlot = angular.copy(adSlot);
            if($scope.selected.type == $scope.adSlotTypes.native) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;
            }

            if($scope.selected.type == $scope.adSlotTypes.dynamic) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;

                // transfer of format number
                adSlot.defaultAdSlot = angular.isObject(adSlot.defaultAdSlot) ? adSlot.defaultAdSlot.id : adSlot.defaultAdSlot;

                if($scope.pickFromLibrary) {
                    angular.forEach(adSlot.libraryAdSlot.libraryExpressions, function(libraryExpression) {
                        if(!!libraryExpression) {
                            delete libraryExpression.expressions;
                            delete libraryExpression.id;
                        }
                    })
                }

                if(!$scope.isNew) {
                    delete adSlot.libraryAdSlot.native;
                }
            }
            else {
                delete adSlot.libraryAdSlot.libraryExpressions;
                delete adSlot.defaultAdSlot;
                delete adSlot.libraryAdSlot.native;
            }

            delete adSlot.type;
            delete adSlot.libraryAdSlot.publisher;
            delete adSlot.libraryAdSlot.libType;

            if(!adSlot.libraryAdSlot.visible) {
                delete adSlot.libraryAdSlot.id;
            }

            return adSlot;
        }

        function _setLibraryAdSLot(adSlotLibrary) {
            if(!!$scope.adSlot.site) {
                var siteId = angular.isObject($scope.adSlot.site) ? $scope.adSlot.site.id : $scope.adSlot.site;

                return DynamicAdSlotManager.one('prospective').get({site: siteId, library: adSlotLibrary.id})
                    .then(function(library) {
                        delete library.id;
                        angular.extend($scope.adSlot, library);

                        _setExpressions(library)
                    })
            }
        }

        function _setExpressions(library) {
            $scope.adSlot.expressions = [];
            angular.forEach(library.libraryAdSlot.libraryExpressions, function(libraryExpression) {
                var ex = {
                    expectAdSlot: libraryExpression.expressions[0].expectAdSlot.id,
                    libraryExpression: libraryExpression.id
                };

                $scope.adSlot.expressions.push(ex);
            });
        }
    }
})();