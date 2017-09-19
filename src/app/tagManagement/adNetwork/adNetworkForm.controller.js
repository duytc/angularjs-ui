(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $translate, _, $filter, blockList, whiteList, AdNetworkCache, queryBuilderService, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, VARIABLE_FOR_AD_TAG, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;

        $scope.allowSelectPublisher = $scope.isAdmin();
        $scope.publishers = publishers;
        $scope.blockList = !$scope.isAdmin() ? blockList : [];
        $scope.whiteList = !$scope.isAdmin() ? whiteList : [];

        $scope.adNetwork = adNetwork || {
            name: null,
            defaultCpmRate: null,
            impressionCap: null,
            networkOpportunityCap: null,
            customImpressionPixels: [],
            expressionDescriptor: {
                groupVal: [],
                groupType: 'AND'
            }
        };

        $scope.selectData = {
        };

        if($scope.isAdmin()) {
            if($scope.isNew) {
                // init default = false because no publisher is selected
            } else {
                // set current publisher
                selectPublisher($scope.adNetwork.publisher);
            }
        }

        if(!$scope.isNew) {
            $scope.whiteList = $filter('selectedPublisher')(whiteList, $scope.adNetwork.publisher);
            $scope.blockList = $filter('selectedPublisher')(blockList, $scope.adNetwork.publisher);

            var networkBlacklists = [];
            angular.forEach(angular.copy($scope.adNetwork.networkBlacklists), function(networkBlacklist) {
                networkBlacklists.push(networkBlacklist.displayBlacklist)
            });

            $scope.adNetwork.networkBlacklists = networkBlacklists;

            angular.forEach($scope.blockList, function(block) {
                var index = _.findIndex($scope.adNetwork.networkBlacklists, function (networkBlacklist) {
                    return !!networkBlacklist && networkBlacklist.id == block.id
                });

                if(index > -1) {
                    block['ticked'] = true;
                }
            });

            var networkWhiteLists = [];
            angular.forEach(angular.copy($scope.adNetwork.networkWhiteLists), function(networkWhiteList) {
                networkWhiteLists.push(networkWhiteList.displayWhiteList)
            });

            $scope.adNetwork.networkWhiteLists = networkWhiteLists;

            angular.forEach($scope.whiteList, function(white) {
                var index = _.findIndex($scope.adNetwork.networkWhiteLists, function (networkWhiteList) {
                    return !!networkWhiteList && networkWhiteList.id == white.id
                });

                if(index > -1) {
                    white['ticked'] = true;
                }
            });
        }

        if(!$scope.isNew) {
            if(angular.isArray($scope.adNetwork.expressionDescriptor) || !$scope.adNetwork.expressionDescriptor) {
                $scope.adNetwork.expressionDescriptor = {groupVal: [], groupType: 'AND'}
            }
        }

        _update();

        function _update() {
            if(!$scope.isNew) {
                _convertGroupVal($scope.adNetwork.expressionDescriptor.groupVal);
            }
        }

        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.selectPublisher = selectPublisher;
        $scope.addCustomImpressionPixel = addCustomImpressionPixel;
        $scope.removeCustomImpressionPixel = removeCustomImpressionPixel;

        $scope.builtVariable = function(expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

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

        /**
         * Add a custom impression pixel
         */
        function addCustomImpressionPixel() {
            if (!$scope.adNetwork.customImpressionPixels) {
                $scope.adNetwork.customImpressionPixels = [];
            }

            $scope.adNetwork.customImpressionPixels.push({
                url: null
            })
        }

        /**
         * Remove a custom impression pixel
         * @param index
         */
        function removeCustomImpressionPixel(index) {
            if(index > -1) {
                $scope.adNetwork.customImpressionPixels.splice(index, 1)
            }
        }

        /**
         * back to list ad networks
         * @return {*}
         */
        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.list');
        }

        /**
         * handle event select Publisher
         * @param publisher
         */
        function selectPublisher(publisher) {
            setTimeout(function () {
                $scope.whiteList = $filter('selectedPublisher')(whiteList, publisher);
                $scope.blockList = $filter('selectedPublisher')(blockList, publisher);

                $scope.adNetwork.networkWhiteLists = [];
                $scope.adNetwork.networkBlacklists = [];
            }, 0);
        }

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var adNetwork = angular.copy($scope.adNetwork);

            var networkBlacklists = [];

            angular.forEach(adNetwork.networkBlacklists, function (networkBlacklist) {
                networkBlacklists.push({displayBlacklist: networkBlacklist.id});
            });

            adNetwork.networkBlacklists = networkBlacklists;

            var networkWhiteLists = [];

            angular.forEach(adNetwork.networkWhiteLists, function (networkWhiteList) {
                networkWhiteLists.push({displayWhiteList: networkWhiteList.id});
            });

            adNetwork.networkWhiteLists = networkWhiteLists;

            _formatGroupVal(adNetwork.expressionDescriptor.groupVal);

            if(adNetwork.expressionDescriptor.groupVal.length == 0) {
                adNetwork.expressionDescriptor = null;
            }

            $scope.formProcessing = true;

            var saveAdNetwork = $scope.isNew ? AdNetworkCache.postAdNetwork(adNetwork) : AdNetworkCache.patchAdNetwork(adNetwork);

            saveAdNetwork
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adNetworkForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('AD_NETWORK_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_NETWORK_MODULE.UPDATE_SUCCESS')
                        });
                    }
                )
                .then(
                    function () {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.list');
                    }
                )
            ;
        };
    }
})();