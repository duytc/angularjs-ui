(function () {
    'use strict';

    angular.module('tagcade.core.resetPassword')
        .controller('CheckEmail', CheckEmail)
    ;

    function CheckEmail($scope, Restangular, AlertService) {
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
                        message: 'An email has been sent to "'+ $scope.username +'". It contains a link you must click to reset your password'
                    })
                },
                function(response) {
                    if(response.status === 404) {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'The username or email address "'+ $scope.username +'" does not exist'
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