(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('AdNetworkForm', AdNetworkForm)
    ;

    function AdNetworkForm($scope, $translate, _, AdNetworkCache, PartnerManager, AlertService, ServerErrorProcessor, adNetwork, publishers, historyStorage, USER_MODULES, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.isNew = adNetwork === null;
        $scope.formProcessing = false;
        $scope.usernameAdNetwork = $scope.isNew ? null : adNetwork.username;

        $scope.allowSelectPublisher = $scope.isAdmin();
        $scope.publishers = publishers;
        $scope.partners = [];

        $scope.isBuildInType = isBuildInType;
        $scope.isCustomType = isCustomType;
        $scope.isEnabledUnifiedReport = isEnabledUnifiedReport;
        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.selectPublisher = selectPublisher;
        $scope.selectPartner = selectPartner;

        $scope.adNetwork = adNetwork || {
            name: null,
            defaultCpmRate: null,
            url: null,
            username: null,
            password: null,
            networkPartner: null,
            impressionCap: null,
            networkOpportunityCap: null
        };

        $scope.DEMAND_PARTNER_TYPE = {
            BUILD_IN: 0, // allow pick a build-in partner for demand partner
            CUSTOM: 1 // normal demand partner
        };

        $scope.selectData = {
            inputType: $scope.DEMAND_PARTNER_TYPE.CUSTOM, // init default is custom type
            enabledUnifiedReport: $scope.isNew ? false : !!$scope.adNetwork.username,// init default = false,
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
         * check if enabled unified report
         * @return {boolean}
         */
        function isEnabledUnifiedReport() {
            return !!$scope.selectData.enabledUnifiedReport;
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

            if (!isEnabledUnifiedReport()) {
                $scope.adNetwork.username = null;
                $scope.adNetwork.password = null;
            }

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