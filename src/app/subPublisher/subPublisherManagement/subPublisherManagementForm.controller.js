(function () {
    'use strict';

    angular
        .module('tagcade.subPublisher.subPublisherManagement')
        .controller('SubPublisherCurrentForm', SubPublisherCurrentForm)
    ;

    function SubPublisherCurrentForm($scope, $translate, $state, AlertService, ServerErrorProcessor, subPublisher, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password'
        };

        $scope.formProcessing = false;

        $scope.countries = COUNTRY_LIST;

        $scope.subPublisher = subPublisher;

        $scope.isFormValid = function() {
            if($scope.subPublisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.subPublisher.plainPassword;
            }

            return $scope.userForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.subPublisher.enabled;
            delete $scope.subPublisher.lastLogin;
            delete $scope.subPublisher.publisher;
            delete $scope.subPublisher.enabledModules;
            delete $scope.subPublisher.subPublisherPartnerRevenue;
            delete $scope.subPublisher.sites;
            delete $scope.subPublisher.subPublisherSites;

            var saveUser = $scope.subPublisher.patch();
            saveUser
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('PUBLISHER_MODULE.UPDATE_PROFILE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return $state.reload();
                }
            )
            ;
        };
    }
})();