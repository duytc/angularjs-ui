(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdNetworkQuicklyForm', AdNetworkQuicklyForm)
    ;

    function AdNetworkQuicklyForm($scope, $filter, $modalInstance, $translate, queryBuilderService, whiteList, blockList, AdNetworkCache, AlertService, ServerErrorProcessor, publishers, Auth, USER_MODULES) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate'
        };

        $scope.formProcessing = false;

        $scope.allowPublisherSelection = Auth.isAdmin();
        $scope.publishers = publishers;

        $scope.adNetwork = {
            name: null,
            defaultCpmRate: null,
            impressionCap: null,
            networkOpportunityCap: null,
            expressionDescriptor: {
                groupVal: [],
                groupType: 'AND'
            }
        };

        $scope.selectData = {
        };

        $scope.blockList = !Auth.isAdmin() ? blockList : [];
        $scope.whiteList = !Auth.isAdmin() ? whiteList : [];

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

        $scope.builtVariable = function(expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        $scope.selectPublisher = selectPublisher;

        if (!Auth.isAdmin()) {
            // set current publisher
            $scope.selectPublisher(Auth.getSession());
        }

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

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

            var saveAdNetwork = AdNetworkCache.postAdNetwork(adNetwork);

            saveAdNetwork
                .catch(
                    function (response) {
                        $modalInstance.close();
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adNetworkForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        $modalInstance.close();
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_NETWORK_MODULE.ADD_NEW_SUCCESS')
                        });
                    }
                )
            ;
        };

        function selectPublisher (publisher) {
            $scope.whiteList = $filter('selectedPublisher')(whiteList, publisher);
            $scope.blockList = $filter('selectedPublisher')(blockList, publisher);

            $scope.adNetwork.networkWhiteLists = [];
            $scope.adNetwork.networkBlacklists = [];
        }
    }
})();