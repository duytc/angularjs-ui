(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $translate, _, $filter, blockList, whiteList, AdNetworkCache, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, USER_MODULES, HISTORY_TYPE_PATH) {
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
            customImpressionPixels: []
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

        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.selectPublisher = selectPublisher;
        $scope.addCustomImpressionPixel = addCustomImpressionPixel;
        $scope.removeCustomImpressionPixel = removeCustomImpressionPixel;

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        /**
         * Add a custom impression pixel
         */
        function addCustomImpressionPixel() {
            if (!$scope.adNetwork.customImpressionPixels) {
                console.log('INIT [] before adding');
                $scope.adNetwork.customImpressionPixels = [];
            }

            console.log('adding new [ url: null ]');
            $scope.adNetwork.customImpressionPixels.push({
                url: null
            })
        }

        /**
         * Remove a custom impression pixel
         * @param index
         */
        function removeCustomImpressionPixel(index) {
            console.log('removing [ url: null ] index ' + index);
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

            $scope.formProcessing = true;

            var saveAdNetwork = $scope.isNew ? AdNetworkCache.postAdNetwork($scope.adNetwork) : AdNetworkCache.patchAdNetwork($scope.adNetwork);

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