(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, $translate, $stateParams, $filter, _, adSlot, publisherList, SiteManager, ChannelManager, DynamicAdSlotManager, adminUserManager, TYPE_AD_SLOT, AlertService, adSlotService, ServerErrorProcessor, libraryAdSlotService, AdSlotLibrariesManager, userSession, historyStorage, HISTORY_TYPE_PATH, RTB_STATUS_TYPES) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        //var adSlotRefactor = null; // this adSlotRefactor use to copy ad slot have been refactor
        var channelsCopy = [];
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
                label: 'Sites',
                key: 'sites'
            },
            {
                label: 'Channels',
                key: 'channels'
            },
            {
                label: 'Standalone Ad Slots',
                key: 'none'
            }
        ];

        $scope.adSlot = angular.isObject(adSlot) ? adSlot.libraryAdSlot : {
            libraryExpressions: [],
            passbackMode: $scope.passbackOption[0].key
        };

        $scope.adSlot.rtbStatus = $scope.isNew ? RTB_STATUS_TYPES.inherit : adSlot.rtbStatus;
        $scope.adSlot.floorPrice = $scope.isNew ? null : adSlot.floorPrice;
        $scope.adSlot.hbBidPrice = $scope.isNew ? null : adSlot.hbBidPrice;
        $scope.adSlot.hbBidPriceCopy = $scope.isNew ? null : _convertHeaderBiddingPriceToString(adSlot.hbBidPrice);

        $scope.selected = {
            type: angular.isObject(adSlot) ? adSlot.type : $scope.typesList.display,
            deployment: !!$stateParams.deployment ? $stateParams.deployment : 'sites',
            defaultAdSlot: angular.isObject(adSlot) && !! adSlot.defaultAdSlot ? adSlot.defaultAdSlot : null,
            sites: [],
            channels: [],
            site: angular.isObject(adSlot) ? adSlot.site : null,
            publisher: adSlot && adSlot.publisher,
            adSlotLibrary: null
        };

        var enabledModules = !!$scope.selected.publisher ? $scope.selected.publisher.enabledModules : null;
        $scope.siteList = angular.isObject(adSlot) && angular.isObject(adSlot.sites) ? adSlot.sites : [];
        $scope.channelList = angular.isObject(adSlot) && angular.isObject(adSlot.channels) ? adSlot.channels : [];

        var AD_SLOT_CONTEXTS = {
            normal: {
                notUseStandalone: 11,
                useStandalone: 12
            },
            standalone: 2
        };

        $scope.adSlotContext = $scope.isNew ? AD_SLOT_CONTEXTS.standalone : AD_SLOT_CONTEXTS.normal.notUseStandalone;

        if(!$scope.isNew) {
            enabledModules = adSlot.site.publisher.enabledModules;

            if(adSlot.libraryAdSlot.visible) {
                $scope.pickFromLibrary = true;
                $scope.selected.adSlotLibrary = adSlot.libraryAdSlot.id;
                getAdSlotLibrary();
            }

            if(!!adSlot.libraryAdSlot.libraryExpressions) {
                convertHeaderBidding(adSlot.libraryAdSlot.libraryExpressions);
            }
        }

        // add new adslot for siteId
        if(!!$stateParams.siteId) {
            $scope.selected.deployment = 'sites';

            SiteManager.one($stateParams.siteId).get()
                .then(function(site) {
                    $scope.adSlot.publisher = site.publisher.id;
                    _getSitesForPublisher($scope.adSlot.publisher, site);
                });
        }

        if(!$scope.isAdmin() && !$stateParams.siteId) {
            _getSitesForPublisher();
        }

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
        $scope.isEnabledModuleHeaderBidding = isEnabledModuleHeaderBidding;
        $scope.selectPublisher = selectPublisher;
        $scope.isNormalAdSlotNotUseStandalone = isNormalAdSlotNotUseStandalone;
        $scope.isNormalAdSlotUseStandalone = isNormalAdSlotUseStandalone;
        $scope.isStandaloneAdSlot = isStandaloneAdSlot;
        $scope.getAdSlotLibrary = getAdSlotLibrary;
        $scope.selectAdSlotLibrary = selectAdSlotLibrary;
        $scope.filterAdSlotForSite = filterAdSlotForSite;
        $scope.changeHeaderBidPrice = changeHeaderBidPrice;

        function selectDeployment(deployment) {
            if(deployment == 'channels') {
                // reset previous selected sites
                $scope.selected.sites = [];
            }

            if(deployment == 'sites') {
                // reset previous selected channels
                $scope.selected.channels = [];
            }

            if(deployment != 'none') {
                if(deployment != 'channels' && $scope.siteList.length === 0) {
                    _getSitesForPublisher($scope.adSlot.publisher);
                }

                if(deployment != 'sites' && $scope.channelList.length === 0) {
                    ChannelManager.one('havesite').getList().then(function (channels) {
                        channelsCopy = channels;
                        $scope.channelList = $filter('selectedPublisher')(channelsCopy, $scope.adSlot.publisher);
                    });
                }
            } else{
                $scope.adSlotContext = AD_SLOT_CONTEXTS.standalone;

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

        function isEnabledModuleHeaderBidding() {
            return isEnabledModule('MODULE_HEADER_BIDDING');
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
            $scope.selected.adSlotLibrary = null;

            if($scope.selected.deployment == 'sites') {
                _getSitesForPublisher(publisher.id);
            }

            if(channelsCopy.length > 0) {
                $scope.channelList = $filter('selectedPublisher')(channelsCopy, publisher);
            }

            enabledModules = publisher.enabledModules;
        }

        function isNormalAdSlotNotUseStandalone() {
            return $scope.adSlotContext == AD_SLOT_CONTEXTS.normal.notUseStandalone;
        }

        function isNormalAdSlotUseStandalone() {
            return $scope.adSlotContext == AD_SLOT_CONTEXTS.normal.useStandalone;
        }

        function isStandaloneAdSlot() {
            return $scope.adSlotContext == AD_SLOT_CONTEXTS.standalone;
        }

        function getAdSlotLibrary() {
            if($scope.pickFromLibrary) {
                AdSlotLibrariesManager.getList()
                    .then(function(adSlotLibrary) {
                        $scope.adSlotLibraryList = adSlotLibrary.plain();
                    }
                );

                if(isNormalAdSlotNotUseStandalone()) {
                    var siteId = !$scope.isNew ? $scope.selected.site.id : $scope.selected.sites[0].id;
                    _getAdSlotUnreferredForSite(siteId);
                }
            } else {
                // reset adSlotLibrary
                $scope.selected.adSlotLibrary = null;

                $scope.adSlot = {
                    libraryExpressions: [],
                    passbackMode: $scope.passbackOption[0].key,
                    publisher: $scope.adSlot.publisher
                };
            }
        }

        function selectAdSlotLibrary(adSlotLibrary) {
            if($scope.selected.type == $scope.typesList.dynamic && isNormalAdSlotNotUseStandalone() && (!!$scope.selected.sites[0] || !!$scope.selected.site)) {
                var siteId = $scope.isNew ? $scope.selected.sites[0].id : $scope.selected.site.id;
                DynamicAdSlotManager.one('prospective').get({library: adSlotLibrary.id, site: siteId})
                    .then(function(adslotdynamic) {
                        $scope.adSlot = adslotdynamic.libraryAdSlot;
                        adSlot = adslotdynamic;
                        $scope.adSlot.expressions = adslotdynamic.expressions;
                        $scope.selected.defaultAdSlot = !!adslotdynamic.defaultAdSlot ? adslotdynamic.defaultAdSlot.id : null;
                        $scope.adSlotsDefault.push(adslotdynamic.defaultAdSlot);

                        _update(true);
                    })
            } else {
                $scope.adSlot = adSlotLibrary;
            }
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
            //adSlotRefactor = adSlot;

            if($scope.pickFromLibrary && $scope.isNew && ($scope.selected.sites.length > 1 || $scope.selected.channels.length > 0)) {
                Manager = AdSlotLibrariesManager.one($scope.selected.adSlotLibrary).customPOST(adSlot, 'createlinks');
            }
            else if(isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) {
                Manager = libraryAdSlotService.getManagerForAdSlotLibrary($scope.selected);
            } else {
                Manager = adSlotService.getManagerForAdSlot($scope.selected);
            }

            var saveAdSlot = $scope.isNew ? ($scope.pickFromLibrary && ($scope.selected.sites.length > 1 || $scope.selected.channels.length > 0) ? Manager : Manager.post(adSlot)) : Manager.one(adSlot.id).patch(adSlot);
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
                    // location path to channel list
                    if((isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) && adSlot.channels.length == 1 && adSlot.sites.length == 0) {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listByChannel');
                    }

                    return backToAdSlotList();
                })
            ;
        }

        function isFormValid() {
            if($scope.pickFromLibrary && $scope.isNew) {
                return $scope.adSlotLibraryForm.$valid && ($scope.selected.sites.length > 0 || $scope.selected.channels.length > 0);
            }

            if($scope.pickFromLibrary && !$scope.isNew) {
                return $scope.adSlotLibraryForm.$valid;
            }

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
            if(isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) {
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

        function filterAdSlotForSite(libraryAdSlot) {
            if(!isNormalAdSlotNotUseStandalone()) {
                return true;
            }

            var index = _.findIndex($scope.adSlotUnreferredList, function(adSlotLib) {
                return adSlotLib.id == libraryAdSlot || adSlotLib.id == libraryAdSlot.id
            });

            if(index > -1) {
                return true
            }

            return false
        }

        function changeHeaderBidPrice(adSlot) {
            adSlot.hbBidPrice = adSlot.hbBidPriceCopy
        }

        function backToAdSlotList() {
            if((isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) && !$scope.pickFromLibrary) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.^.^.tagLibrary.adSlot.list');
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();

            //if($scope.isAdmin()) {
            //    if(!!historyAdSlot.siteId) {
            //        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlotRefactor.site.id || adSlotRefactor.site});
            //    } else {
            //        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
            //    }
            //}

            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }

        function selectType(type) {
            $scope.selected.type = type;
            $scope.selected.adSlotLibrary = null;

            $scope.adSlot = {
                libraryExpressions: [],
                passbackMode: $scope.passbackOption[0].key,
                publisher: $scope.adSlot.publisher
            };

            updateDueToDeploymentChanged();
        }

        function findTypeLabel(type) {
            return _.find($scope.adSlotTypeOptions, function(typeOption)
            {
                return typeOption.key == type;
            });
        }

        function convertHeaderBidding(libraryExpressions) {
            angular.forEach(libraryExpressions, function(expressionRoot) {
                if(angular.isObject(expressionRoot.expressions)) {
                    expressionRoot.expressions[0].hbBidPriceCopy = _convertHeaderBiddingPriceToString(expressionRoot.expressions[0].hbBidPrice);
                }
            });
        }

        function _getSitesForPublisher(publisherId, site) {
            var Manager = !$scope.isAdmin() ? SiteManager.getList() : adminUserManager.one(publisherId).one('sites').getList();

            Manager
                .then(function (data) {
                    $scope.siteList = data;

                    if(!!site) {
                        var idxSite = _.findIndex(data, function(site) {

                            return $stateParams.siteId == site.id
                        });

                        if(idxSite > -1) {
                            /**
                             * set default publisher when create ad slot quickly from list adslot for site
                             */
                            $scope.adSlot.publisher = $scope.siteList[idxSite].publisher.id;
                            $scope.siteList[idxSite]['ticked'] = true;

                            /* IMPORTANT: remember set selected site to site got from $stateParams.siteId!!! */
                            $scope.selected.sites = [site];
                        }
                    }
                })
            ;
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
            if(isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) {
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

        function _update(allow) {
            if(!$scope.isNew || allow) {
                if($scope.selected.type == $scope.typesList.dynamic) {
                    if(isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) {
                        _getLibraryAdSlots($scope.selected.type);
                    } else {
                        angular.forEach(adSlot.libraryAdSlot.libraryExpressions, function(libraryExpression) {
                            angular.forEach(libraryExpression.expressionDescriptor.groupVal, function(group) {
                                if(angular.isString(group.val) && (group.var == '${COUNTRY}' || group.var == '${DEVICE}')) {
                                    group.val = group.val.split(',');
                                    group.cmp = group.cmp == '==' ||  group.cmp == 'is' ? 'is' : 'isNot';
                                }
                            });
                        });

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
        function _getLibraryAdSlots(type) {
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

        function _getAdSlotUnreferredForSite(site) {
            if($scope.pickFromLibrary) {
                AdSlotLibrariesManager.one('unreferred').one('site', site).getList()
                    .then(function(adSlotLibrary) {
                        $scope.adSlotUnreferredList = adSlotLibrary.plain();

                        // merge library adSlot when edit ad slot
                        if(!$scope.isNew) {
                            $scope.adSlotUnreferredList.push($scope.adSlot);
                        }
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
            if($scope.pickFromLibrary && ($scope.selected.sites.length > 1 || $scope.selected.channels.length > 0)) {
                return _refactorCreateAdSlot();
            }

            else if(isStandaloneAdSlot() || isNormalAdSlotUseStandalone()) {
                return _refactorLibraryAdSlot(adSlot);
            }

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

                _refactorExpressions(adSlot.libraryExpressions);
            }
            else {
                delete adSlot.libraryExpressions;
                delete adSlot.defaultLibraryAdSlot;
                delete adSlot.native;
                delete adSlot.hbBidPrice;
            }

            if(!$scope.isAdmin()) {
                delete adSlot.publisher;
            }

            if(!$scope.isNew) {
                delete adSlot.sites;
                delete adSlot.channels;
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

        function _refactorCreateAdSlot() {
            var adSlot = {
                sites: [],
                channels: []
            };

            angular.forEach($scope.selected.sites, function(site) {
                adSlot.sites.push(site.id)
            });
            angular.forEach($scope.selected.channels, function(channel) {
                adSlot.channels.push(channel.id)
            });

            return adSlot;
        }

        function _refactorDeployAdSlot(adSlot) {
            adSlot = {
                id: !$scope.isNew ? $stateParams.id: undefined,
                defaultAdSlot: null,
                libraryAdSlot: angular.copy(adSlot),
                rtbStatus: adSlot.rtbStatus,
                floorPrice: adSlot.floorPrice,
                hbBidPrice: adSlot.hbBidPrice
            };

            adSlot.site = $scope.isNew ? $scope.selected.sites[0].id : $scope.selected.site.id;
            if($scope.selected.type == $scope.typesList.native) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;
                delete adSlot.libraryAdSlot.autoFit;
                delete adSlot.libraryAdSlot.passbackMode;
                delete adSlot.floorPrice;
                delete adSlot.hbBidPrice;
            }

            if($scope.selected.type == $scope.typesList.dynamic) {
                delete adSlot.libraryAdSlot.height;
                delete adSlot.libraryAdSlot.width;
                delete adSlot.libraryAdSlot.autoFit;
                delete adSlot.libraryAdSlot.passbackMode;
                delete adSlot.floorPrice;
                delete adSlot.hbBidPrice;

                _refactorExpressions(adSlot.libraryAdSlot.libraryExpressions);

                // transfer of format number
                adSlot.defaultAdSlot = angular.isObject($scope.selected.defaultAdSlot) ? $scope.selected.defaultAdSlot.id : $scope.selected.defaultAdSlot;

                if($scope.pickFromLibrary) {
                    adSlot.expressions = [];
                    angular.forEach(adSlot.libraryAdSlot.libraryExpressions, function(libraryExpression) {
                        if(angular.isObject(libraryExpression) && angular.isArray(libraryExpression.expressions)) {
                            var expression = libraryExpression.expressions[0];
                            adSlot.expressions.push({expectAdSlot: expression.expectAdSlot.id || expression.expectAdSlot, hbBidPrice: expression.hbBidPrice, libraryExpression: libraryExpression.id})
                        }
                    });
                }

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
            delete adSlot.libraryAdSlot.expressions;
            delete adSlot.libraryAdSlot.hbBidPrice;
            delete adSlot.libraryAdSlot.hbBidPriceCopy;

            delete adSlot.libraryAdSlot.libType;

            if(!adSlot.libraryAdSlot.visible) {
                delete adSlot.libraryAdSlot.id;
            }

            return adSlot;
        }

        function _refactorExpressions(libraryExpressions) {
            angular.forEach(libraryExpressions, function(libraryExpression) {
                angular.forEach(libraryExpression.expressions, function(expression) {
                    delete expression.hbBidPriceCopy;
                    delete expression.dynamicAdSlot;
                    delete expression.expressionInJs
                });

                angular.forEach(libraryExpression.expressionDescriptor.groupVal, function(group) {
                    if(angular.isObject(group.val)) {
                        group.val = group.val.toString();
                    }
                });
            });
        }

        function _convertHeaderBiddingPriceToString(price) {
            if(typeof price != 'number') {
                return null
            }

            return price.toFixed(2).toString()
        }

        /* watch the changing of sites selected in deployment method */
        $scope.$watch(function () {
                return $scope.selected.sites
            },
            function(newValue, oldValue) {
                if(newValue.length !== oldValue.length) {
                    updateDueToDeploymentChanged()
                }
            }
        );

        /* watch the changing of channel selected in deployment method */
        $scope.$watch(function () {
                return $scope.selected.channels
            },
            function(newValue, oldValue) {
                if(newValue.length !== oldValue.length) {
                    updateDueToDeploymentChanged()
                }
            }
        );

        /**
         * update var, form Due To Deployment way Changed
         */
        function updateDueToDeploymentChanged() {
            // skip check if edit mode
            if (!$scope.isNew) {
                return;
            }

            // if multiple selected channels => this is normal ad slot use standalone ad slot
            if ($scope.selected.channels.length > 0) {
                $scope.adSlotContext = AD_SLOT_CONTEXTS.normal.useStandalone;

                // reset form
                _resetForm();

                // get ad slots in library
                _getLibraryAdSlots($scope.selected.type);
                return;
            }

            // if selected sites only one => this is normal ad slot with no standalone ad slot
            if ($scope.selected.sites.length == 1) {
                // reset adSlotLibrary
                $scope.selected.adSlotLibrary = null;

                // reset form
                $scope.adSlot = {
                    libraryExpressions: [],
                    passbackMode: $scope.passbackOption[0].key,
                    publisher: $scope.adSlot.publisher
                };

                $scope.adSlotContext = AD_SLOT_CONTEXTS.normal.notUseStandalone;

                // reset form for dynamic only
                if ($scope.selected.type == $scope.typesList.dynamic) {
                    _resetFormForDynamic();
                }

                // get ad slots list
                _getAdSlotList($scope.selected.sites[0].id, $scope.selected.type);
                _getAdSlotUnreferredForSite($scope.selected.sites[0].id);
                return;
            }

            // if no site selected => this is standalone ad slot
            if ($scope.selected.sites.length == 0) {
                $scope.adSlotContext = AD_SLOT_CONTEXTS.standalone;

                _resetForm();

                _getLibraryAdSlots($scope.selected.type);
                return;
            }

            // if selected sites more than one => this is normal ad slot use standalone ad slot
            if ($scope.selected.sites.length > 1) {
                $scope.adSlotContext = AD_SLOT_CONTEXTS.normal.useStandalone;
                _resetForm();
                _getLibraryAdSlots($scope.selected.type);
            }
        }
    }
})();