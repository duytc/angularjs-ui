(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandPartner')
        .controller('DemandPartnerForm', DemandPartnerForm)
    ;

    function DemandPartnerForm($scope, $translate, demandPartner, publishers, AlertService, VideoDemandPartnerManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH) {

        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = demandPartner === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;

        $scope.demandPartner = demandPartner || {
            name: null,
            defaultTagURL: null
        };

        $scope.backToListDemandPartner = backToListDemandPartner;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function backToListDemandPartner() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.demandPartner, '^.list');
        }

        function selectPublisher(publisher) {
        }

        function isFormValid() {
            return $scope.demandPartnerForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.demandPartner.activeAdTagsCount;
            delete $scope.demandPartner.pausedAdTagsCount;

            var saveDemandPartner = $scope.isNew
                ? VideoDemandPartnerManager.post($scope.demandPartner)
                : $scope.demandPartner.patch();

            saveDemandPartner
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.demandPartnerForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.ADD_NEW_SUCCESS') : $translate.instant('VIDEO_DEMAND_PARTNER_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.demandPartner, '^.list');
                }
            )
            ;
        }
    }
})();