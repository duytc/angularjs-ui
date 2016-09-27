(function () {
    'use strict';

    angular.module('tagcade.core.login')
        .controller('Login', Login)
    ;

    function Login($scope, $rootScope, AUTH_EVENTS, Auth) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.isFormValid = function() {
            return $scope.loginForm.$valid;
        };

        $scope.formProcessing = false;

        $scope.login = function (credentials) {
            if ($scope.formProcessing) {
                return;
            }

            $scope.formProcessing = true;

            Auth.logout();

            Auth.login(credentials, true)
                .then(
                    function () {
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    },
                    function () {
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    }
                )
                .finally(function() {
                    $scope.formProcessing = false;
                })
            ;
        };
    }
})();