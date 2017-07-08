(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdNetworkQuicklyForm', AdNetworkQuicklyForm)
    ;

    function AdNetworkQuicklyForm($scope, $filter, $modalInstance, $translate, whiteList, blockList, AdNetworkCache, AlertService, ServerErrorProcessor, publishers, Auth, USER_MODULES) {
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
            networkOpportunityCap: null
        };

        $scope.selectData = {
        };

        $scope.blockList = !Auth.isAdmin() ? blockList : [];
        $scope.whiteList = !Auth.isAdmin() ? whiteList : [];

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

            var networkBlacklists = [];

            angular.forEach($scope.adNetwork.networkBlacklists, function (networkBlacklist) {
                networkBlacklists.push({displayBlacklist: networkBlacklist.id});
            });

            $scope.adNetwork.networkBlacklists = networkBlacklists;


            var networkWhiteLists = [];

            angular.forEach($scope.adNetwork.networkWhiteLists, function (networkWhiteList) {
                networkWhiteLists.push({displayWhiteList: networkWhiteList.id});
            });

            $scope.adNetwork.networkWhiteLists = networkWhiteLists;

            var saveAdNetwork = AdNetworkCache.postAdNetwork($scope.adNetwork);

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