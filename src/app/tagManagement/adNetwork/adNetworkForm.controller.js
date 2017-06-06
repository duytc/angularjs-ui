(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $translate, _, $filter, blockList, whiteList, AdNetworkCache, PartnerManager, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, USER_MODULES, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;
       // $scope.usernameAdNetwork = $scope.isNew ? null : adNetwork.username;

        $scope.allowSelectPublisher = $scope.isAdmin();
        $scope.publishers = publishers;
        $scope.blockList = !$scope.isAdmin() ? blockList : [];
        $scope.whiteList = !$scope.isAdmin() ? whiteList : [];
        $scope.partners = [];

        $scope.adNetwork = adNetwork || {
            name: null,
            defaultCpmRate: null,
            url: null,
            /*   username: null,
             password: null,*/
            networkPartner: null,
            impressionCap: null,
            networkOpportunityCap: null,
            customImpressionPixels: []
        };

        $scope.DEMAND_PARTNER_TYPE = {
            BUILD_IN: 0, // allow pick a build-in partner for demand partner
            CUSTOM: 1 // normal demand partner
        };

        $scope.selectData = {
            inputType: $scope.DEMAND_PARTNER_TYPE.CUSTOM, // init default is custom type
            networkPartner: $scope.isNew ? null : $scope.adNetwork.networkPartner // selected partner, using for updating ad network cache
        };

        if($scope.isAdmin()) {
            if($scope.isNew) {
                // init default = false because no publisher is selected
                $scope.hasUnifiedModule = false;
            } else {
                // set current publisher
                selectPublisher($scope.adNetwork.publisher);
            }
        } else {
            PartnerManager.getList({all: true})
                .then(function (data) {
                    // get all unused partners, also include old partner of this ad network
                    $scope.partners = $scope.adNetwork.networkPartner == null ? data : [$scope.adNetwork.networkPartner].concat(data);
                });
        }

        // update $scope.selectData values
        if ($scope.hasUnifiedModule) {
            // only support build-in type if has Unified module
            $scope.selectData.inputType = $scope.isNew || !$scope.adNetwork.networkPartner ? $scope.DEMAND_PARTNER_TYPE.CUSTOM : $scope.DEMAND_PARTNER_TYPE.BUILD_IN;
        } else {
            $scope.selectData.inputType = $scope.DEMAND_PARTNER_TYPE.CUSTOM;
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

        $scope.isBuildInType = isBuildInType;
        $scope.isCustomType = isCustomType;
        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.selectPublisher = selectPublisher;
        $scope.selectPartner = selectPartner;
        $scope.addCustomImpressionPixel = addCustomImpressionPixel;
        $scope.removeCustomImpressionPixel = removeCustomImpressionPixel;

        $scope.isFormValid = function() {
            return $scope.adNetworkForm.$valid;
        };

        /**
         * check if current selected option is build-in type
         * @return {boolean}
         */
        function isBuildInType() {
            return $scope.selectData.inputType == $scope.DEMAND_PARTNER_TYPE.BUILD_IN;
        }

        /**
         * check if current selected option is custom type
         * @return {boolean}
         */
        function isCustomType() {
            return $scope.selectData.inputType == $scope.DEMAND_PARTNER_TYPE.CUSTOM;
        }

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

                // update $scope.hasUnifiedModule
                $scope.hasUnifiedModule = publisher.enabledModules.indexOf(USER_MODULES.unified) !== -1;

                // get all unused partners for Publisher
                PartnerManager.getList({all: true, publisher: publisher.id})
                    .then(function (data) {
                        $scope.partners = $scope.adNetwork.networkPartner == null ? data : [$scope.adNetwork.networkPartner].concat(data);
                    });

                // reset selected partner
                if(isBuildInType()) {
                    $scope.adNetwork.networkPartner = null;

                    selectPartner(null);
                }
            }, 0);
        }

        /**
         * handle event select Partner
         * @param partner
         */
        function selectPartner (partner) {
            $scope.selectData.networkPartner = partner;
        }

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.adNetwork.networkPartner = $scope.selectData.networkPartner;

            // clear name and url if is build-in type
            if(isBuildInType()) {
                $scope.adNetwork.name = null;
                $scope.adNetwork.url = null
            } else { // is CustomType: clear network partner selected from drop down
                $scope.selectData.networkPartner = null;
                $scope.adNetwork.networkPartner = null;
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

            var saveAdNetwork = $scope.isNew ? AdNetworkCache.postAdNetwork($scope.adNetwork) : AdNetworkCache.patchAdNetwork($scope.adNetwork, $scope.selectData.networkPartner);

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