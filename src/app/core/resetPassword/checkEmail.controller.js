(function () {
    'use strict';

    angular.module('tagcade.core.resetPassword')
        .controller('CheckEmail', CheckEmail)
    ;

    function CheckEmail($scope, $translate, Restangular, AlertService) {
        $scope.username = null;

        $scope.sendEmail = sendEmail;
        $scope.showForm = true;

        $scope.isFormValid = function() {
            return $scope.forgotPasswordForm.$valid && !!$scope.username;
        };

        function sendEmail() {
            Restangular.one('resetting').one('sendEmail').customPOST({username : $scope.username})
                .then(
                function() {
                    $scope.showForm = false;

                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('RESET_PASSWORD_MODULE.SEND_EMAIL_SUCCESS', {username: $scope.username})
                    })
                },
                function(response) {
                    if(response.status === 404) {
                        AlertService.addAlert({
                            type: 'error',
                            message: $translate.instant('RESET_PASSWORD_MODULE.SEND_EMAIL_FAIL', {username: $scope.username})
                        });
                    }

                    else {
                        AlertService.addAlert({
                            type: 'error',
                            message: $translate.instant('RESET_PASSWORD_MODULE.INTERNAL_ERROR')
                        });
                    }
                })
            ;
        }
    }
})();