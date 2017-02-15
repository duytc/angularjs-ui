(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdNetworkQuicklyForm', AdNetworkQuicklyForm)
    ;

    function AdNetworkQuicklyForm($scope, $modalInstance, $translate, AdNetworkCache, AlertService, ServerErrorProcessor, publishers, PartnerManager, Auth, USER_MODULES) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            defaultCpmRate: 'Default CPM Rate',
            url: 'Url'
        };

        $scope.hasUnifiedModule = Auth.isAdmin() ? false : Auth.getSession().enabledModules.indexOf(USER_MODULES.unified) !== -1;
        $scope.formProcessing = false;

        $scope.allowPublisherSelection = Auth.isAdmin();
        $scope.publishers = publishers;
        $scope.partners = [];

        $scope.adNetwork = {
            name: null,
            defaultCpmRate: null,
            url: null,
            networkPartner: null,
            impressionCap: null,
            networkOpportunityCap: null
        };

        $scope.DEMAND_PARTNER_TYPE = {
            BUILD_IN: 0, // allow pick a build-in partner for demand partner
            CUSTOM: 1 // normal demand partner
        };

        $scope.selectData = {
            inputType: $scope.DEMAND_PARTNER_TYPE.CUSTOM // init default is custom type
        };

        $scope.isBuildInType = isBuildInType;
        $scope.isCustomType = isCustomType;
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

            if(isBuildInType()) {
                $scope.adNetwork.name = null;
                $scope.adNetwork.url = null
            } else {
                $scope.adNetwork.networkPartner = null;
            }

            $scope.formProcessing = true;

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
                        AlertService.addAlert({
                            type: 'success',
                            message: $translate.instant('AD_NETWORK_MODULE.ADD_NEW_SUCCESS')
                        });
                    }
                )
            ;
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

        function selectPublisher (publisher) {
            $scope.hasUnifiedModule = publisher.enabledModules.indexOf(USER_MODULES.unified) !== -1;

            // get all unused partners for Publisher
            PartnerManager.getList({all: true, publisher: publisher.id})
                .then(function (data) {
                    $scope.partners = data;
                }
            );
        }
    }
})();