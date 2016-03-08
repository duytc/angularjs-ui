(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $translate, $stateParams, $filter, _, adSlot, publisherList, SiteManager, ChannelManager, TYPE_AD_SLOT, AlertService, adSlotService, ServerErrorProcessor, libraryAdSlotService, AdSlotLibrariesManager, userSession, historyStorage, HISTORY_TYPE_PATH, RTB_STATUS_TYPES) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        var adSlotRefactor = null; // this adSlotRefactor use to copy ad slot have been refactor
        $scope.isNew = adSlot === null;
        $scope.publisherList = publisherList;

        $scope.formProcessing = false;
        $scope.typesList = TYPE_AD_SLOT;
        $scope.rtbStatusTypes = RTB_STATUS_TYPES;

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

        $scope.deploymentOptions = [
            {
                label: 'Standalone',
                key: 'none'
            },
            {
                label: 'Sites Or Channels',
                key: 'siteOrChannel'
            }
        ];

        $scope.adSlot = angular.isObject(adSlot) ? adSlot.libraryAdSlot : {
            libraryExpressions: [],
            passbackMode: $scope.passbackOption[0].key
        };

        $scope.adSlot.rtbStatus = $scope.isNew ? RTB_STATUS_TYPES.inherit : adSlot.rtbStatus;
        $scope.adSlot.floorPrice = $scope.isNew ? null : adSlot.floorPrice;

        $scope.selected = {
            type: angular.isObject(adSlot) ? adSlot.type : $scope.typesList.display,
            deployment: 'none',
            defaultAdSlot: angular.isObject(adSlot) && !! adSlot.defaultAdSlot ? adSlot.defaultAdSlot : null,
            sites: [],
            channels: [],
            site: angular.isObject(adSlot) ? adSlot.site : null,
            publisher: adSlot && adSlot.publisher
        };

        var enabledModules = !!$scope.selected.publisher ? $scope.selected.publisher.enabledModules : null;
        $scope.siteList = angular.isObject(adSlot) ? adSlot.sites : [];
        $scope.channelList = angular.isObject(adSlot) ? adSlot.channels : [];
        $scope.isLibrary = $scope.isNew;

        $scope.adSlotsDefault = [{id: null, name: 'None', libraryAdSlot: {name: 'None'}}];
        _update();

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;
        $scope.showForDisplayAdSlot = showForDisplayAdSlot;
        $scope.showForNativeAdSlot = showForNativeAdSlot;
        $scope.showForDynamicAdSlot = showForDynamicAdSlot;
        $scope.checkNative = checkNative;
        $scope.selectType = selectType;
        $scope.filterEntityType = filterEntityType;
        $scope.backToAdSlotList = backToAdSlotList;
        $scope.findTypeLabel = findTypeLabel;
        $scope.selectDeployment = selectDeployment;
        $scope.filterDeployEntityType = filterDeployEntityType;
        $scope.selectDefaultAdSlot = selectDefaultAdSlot;
        $scope.isEnabledModuleRtb = isEnabledModuleRtb;
        $scope.selectPublisher = selectPublisher;

        function selectDeployment(deployment) {
            if(deployment == 'siteOrChannel' && $scope.siteList.length === 0) {
                SiteManager.getList()
                    .then(function(sites) {
                        $scope.siteList = sites;
                    });

                ChannelManager.getList().then(function (channels) {
                    $scope.channelList = channels.plain();
                });

                return;
            }

            if(deployment == 'none') {
                $scope.isLibrary = true;

                // reset previous selected sites/channels
                $scope.selected.sites = [];
                $scope.selected.channels = [];
            }
        }

        function showForDisplayAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.display;
        }

        function showForDynamicAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.dynamic;
        }

        function isEnabledModuleRtb() {
            return isEnabledModule('MODULE_RTB');
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;

            enabledModules = publisher.enabledModules;
        }

        function isEnabledModule(module) {
            if(!$scope.isAdmin()) {
                enabledModules = userSession.enabledModules
            }

            if($scope.isNew) {
                return enabledModules != null ? enabledModules.indexOf(module) > -1 : false;
            }

            return $scope.adSlot.publisher != null ? $scope.adSlot.publisher.enabledModules.indexOf(module) > -1 : false;
        }


        function showForNativeAdSlot() {
            return $scope.selected.type == TYPE_AD_SLOT.native;
        }

        function selectDefaultAdSlot(adSlot) {
            if(adSlot.libraryAdSlot) {
                $scope.adSlot.defaultLibraryAdSlot = adSlot.libraryAdSlot.id;
            }
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var adSlot;
            var Manager;

            adSlot = _refactorAdSlot($scope.adSlot);
            adSlotRefactor = adSlot;

            if($scope.isLibrary) {
                Manager = libraryAdSlotService.getManagerForAdSlotLibrary($scope.selected);
            } else {
                Manager = adSlotService.getManagerForAdSlot($scope.selected);
            }

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
                    return backToAdSlotList();
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
            if($scope.isLibrary) {
                checkNativeForLibrary();
            } else {
                checkNativeForDeploy()
            }
        }

        function checkNativeForLibrary() {
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

        function checkNativeForDeploy() {
            if($scope.adSlot.native) {
                return;
            }

            if(!!$scope.selected.defaultAdSlot) {
                var adSlotId = !!$scope.selected.defaultAdSlot.id ? $scope.selected.defaultAdSlot.id : $scope.selected.defaultAdSlot;
                var defaultAdSlot = _findAdSlot(adSlotId);

                if(defaultAdSlot.type == $scope.typesList.native) {
                    $scope.selected.defaultAdSlot = null;
                }
            }

            angular.forEach($scope.adSlot.libraryExpressions, function(expressionDescriptor) {
                if(!!expressionDescriptor.expressions[0].expectAdSlot) {
                    var adSlotId = !!expressionDescriptor.expressions[0].expectAdSlot.id ? expressionDescriptor.expressions[0].expectAdSlot.id : expressionDescriptor.expressions[0].expectAdSlot;
                    var adSlot = _findAdSlot(adSlotId);

                    if(adSlot.type == $scope.typesList.native) {
                        expressionDescriptor.expressions[0].expectAdSlot = null;
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

        function filterDeployEntityType(adSlot) {
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

        function backToAdSlotList() {
            if($scope.isLibrary) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.^.^.tagLibrary.adSlot.list');
            }

            if($scope.isAdmin()) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlotRefactor.site});
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();
            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
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
            if($scope.isLibrary) {
                return _validateSingleExpressionLibrary(expression);
            }

            return _validateSingleExpressionDeploy(expression)
        }

        function _validateSingleExpressionDeploy(expression) {
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

        function _validateSingleExpressionLibrary(expression) {
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
                name: label || 'None',
                libraryAdSlot: {
                    name: label || 'None'
                }
            });

            return data;
        }

        function _resetForm() {
            if(!!$scope.adSlot.defaultLibraryAdSlot) {
                $scope.adSlot.defaultLibraryAdSlot = null;
            }

            angular.forEach($scope.adSlot.libraryExpressions, function(expressionDescriptor) {
                expressionDescriptor.expectLibraryAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        function _resetFormForDynamic() {
            if(!!$scope.selected.defaultAdSlot) {
                $scope.selected.defaultAdSlot = null;
            }

            angular.forEach($scope.adSlot.libraryExpressions, function(expressionDescriptor) {
                expressionDescriptor.expectLibraryAdSlot = null;
                expressionDescriptor.startingPosition = null;
            });
        }

        function _update() {
            if(!$scope.isNew) {
                if($scope.selected.type == $scope.typesList.dynamic) {
                    if($scope.isLibrary) {
                        _getAdSlots($scope.selected.type);
                    } else {
                        _getAdSlotList($scope.selected.site.id)
                    }

                }
            }
        }

        /**
         * get list ad slot in library (standalone)
         * @param type
         * @private
         */
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

        /**
         * get list ad slot have been deploy
         *
         * @param siteId
         * @param type
         * @private
         */
        function _getAdSlotList(siteId, type) {
            type = !!type ? type : $scope.selected.type;

            if((!$scope.isNew && $scope.selected.type == $scope.typesList.dynamic) || ($scope.isNew && type == $scope.typesList.dynamic)) {
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
                        _resetFormForDynamic();
                    }

                    $scope.tags = adSlotService.getTagsAdSlotDynamic($filter('filter')(adSlots.plain(), {type: $scope.typesList.dynamic}));
                });
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
            if($scope.isLibrary) return _refactorLibraryAdSlot(adSlot);
            return _refactorDeployAdSlot(adSlot);
        }

        function _refactorLibraryAdSlot(adSlot) {
            adSlot = angular.copy(adSlot);

            adSlot.sites = [];
            adSlot.channels = [];
            angular.forEach($scope.selected.sites, function(site) {
                adSlot.sites.push(site.id)
            });
            angular.forEach($scope.selected.channels, function(channel) {
                adSlot.channels.push(channel.id)
            });

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
            delete adSlot.rtbStatus;
            delete adSlot.site;
            delete adSlot.floorPrice;

            if($scope.selected.type == $scope.typesList.dynamic) {
                if(!$scope.isNew) {
                    delete adSlot.native;
                }
            }

            return adSlot;
        }

        function _refactorDeployAdSlot(adSlot) {
            adSlot = {
                id: !$scope.isNew ? $stateParams.id: undefined,
                defaultAdSlot: null,
                libraryAdSlot: angular.copy(adSlot),
                rtbStatus: adSlot.rtbStatus,
                floorPrice: adSlot.floorPrice
            };

            adSlot.site = $scope.isNew ? $scope.selected.sites[0].id : $scope.selected.site.id;
            if($scope.selected.type == $scope.typesList.native) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;
                delete adSlot.libraryAdSlot.autoFit;
                delete adSlot.libraryAdSlot.passbackMode;
                delete adSlot.floorPrice;
            }

            if($scope.selected.type == $scope.typesList.dynamic) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;
                delete adSlot.libraryAdSlot.autoFit;
                delete adSlot.libraryAdSlot.passbackMode;
                delete adSlot.floorPrice;

                // transfer of format number
                adSlot.defaultAdSlot = angular.isObject($scope.selected.defaultAdSlot) ? $scope.selected.defaultAdSlot.id : $scope.selected.defaultAdSlot;

                if(!$scope.isNew) {
                    delete adSlot.libraryAdSlot.native;
                }
            }
            else {
                delete adSlot.libraryAdSlot.libraryExpressions;
                delete adSlot.defaultAdSlot;
                delete adSlot.libraryAdSlot.native;
                delete adSlot.expressions;
            }

            // not include rtbStatus if module rtb not enabled in publisher
            if (!isEnabledModuleRtb()) {
                delete adSlot.rtbStatus;
            }

            delete adSlot.type;
            delete adSlot.libraryAdSlot.publisher;
            delete adSlot.libraryAdSlot.sites;
            delete adSlot.libraryAdSlot.channels;
            delete adSlot.libraryAdSlot.isRonAdSlot;
            delete adSlot.libraryAdSlot.rtbStatus;
            delete adSlot.libraryAdSlot.site;
            delete adSlot.libraryAdSlot.floorPrice;

            delete adSlot.libraryAdSlot.libType;

            if(!adSlot.libraryAdSlot.visible) {
                delete adSlot.libraryAdSlot.id;
            }

            return adSlot;
        }

        $scope.$watch(function(){ return $scope.selected.sites }, function() {
            if($scope.selected.channels.length > 0 || !$scope.isNew) {
                return
            }

            if($scope.selected.sites.length == 1 && $scope.isLibrary) {
                $scope.isLibrary = false;
                _resetFormForDynamic();
                _getAdSlotList($scope.selected.sites[0].id, $scope.selected.type);
            } else if($scope.selected.sites.length != 1 && !$scope.isLibrary){
                $scope.isLibrary = true;
                _resetForm();
                _getAdSlots($scope.selected.type);
            }
        });

        $scope.$watch(function(){ return $scope.selected.channels }, function() {
            if($scope.selected.channels.length > 0 && !$scope.isLibrary) {
                $scope.isLibrary = true;
                _resetForm();
                // get ad slots in library
                _getAdSlots($scope.selected.type);
            }
        });
    }
})();