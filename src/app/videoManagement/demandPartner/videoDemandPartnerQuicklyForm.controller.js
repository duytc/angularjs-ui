(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandPartner')
        .controller('VideoDemandPartnerQuicklyForm', VideoDemandPartnerQuicklyForm)
    ;

    function VideoDemandPartnerQuicklyForm($scope, _, Auth, $modalInstance, demandPartners, publishers, publisher, VideoDemandPartnerManager, ServerErrorProcessor) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.formProcessing = false;
        $scope.publishers = publishers;
        $scope.isAdmin = Auth.isAdmin();

        $scope.demandPartner = {
            name: null,
            defaultTagURL: null
        };

        $scope.selectedData = {
            publisher: publisher
        };

        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.findPublisher = findPublisher;

        function selectPublisher(publisher) {
        }

        function isFormValid() {
            return $scope.demandPartnerForm.$valid;
        }

        function findPublisher() {
            return _.find(publishers, function(item) {
                return item.id == publisher.id || item.id == publisher
            });
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if($scope.isAdmin && !$scope.demandPartner.publisher) {
                $scope.demandPartner.publisher = $scope.selectedData.publisher
            }

            var saveDemandPartner = VideoDemandPartnerManager.post($scope.demandPartner);

            saveDemandPartner
                .catch(
                function (response) {
                    $modalInstance.close();

                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.demandPartnerForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function (videoDemandPartner) {
                    demandPartners.push(videoDemandPartner);

                    $modalInstance.close();
                })
            ;
        }
    }
})();