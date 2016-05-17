(function () {
    'use strict';

    angular
        .module('tagcade.publisher.accountManagement')
        .controller('AccountForm', AccountForm)
    ;

    function AccountForm($scope, $translate, $state, AlertService, ServerErrorProcessor, publisher, REPORT_SETTINGS, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password'
        };

        $scope.formProcessing = false;

        $scope.countries = COUNTRY_LIST;

        $scope.publisher = publisher;

        if($scope.publisher.settings.length == 0) {
            $scope.publisher.settings = REPORT_SETTINGS.default;
        }

        $scope.isFormValid = function() {
            if($scope.publisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.publisher.plainPassword;
            }

            return $scope.userForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.publisher.id = null;
            delete $scope.publisher.enabled;
            delete $scope.publisher.enabledModules;
            delete $scope.publisher.billingRate;
            delete $scope.publisher.tagDomain;
            delete publisher.publisherExchanges;

            var saveUser = $scope.publisher.patch();
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