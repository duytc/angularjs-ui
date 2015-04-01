(function () {
    'use strict';

    angular.module('tagcade.core.resetPassword')
        .controller('ChangePassword', ChangePassword)
    ;

    function ChangePassword($scope, $state, Restangular, token, AlertService) {
        $scope.password = null;
        $scope.repeatPassword = null;

        $scope.isFormValid = function() {
            return $scope.resetForm.$valid && $scope.password === $scope.repeatPassword;
        };

        $scope.changePassword = function() {
            Restangular.one('resetting').one('reset').one(token).customPOST({ tagcade_user_system_publisher_resetting_form: { plainPassword: { first: $scope.password, second: $scope.repeatPassword }}})
                .then(
                function() {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'Change successful, login to continue'
                    });

                    $state.go('login');
                },
                function(response) {
                    if(response.status = 404) {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'The token "' + token + '" is not existed'
                        });
                    }

                    if(response.status = 408) {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'The token "' + token + '" is expired. Please try to reset password again'
                        });
                    }

                    else {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'Internal error. Please contact administrator for further instruction'
                        });
                    }
                })
            ;
        }
    }
})();