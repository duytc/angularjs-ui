angular.module('tagcade.core.auth')

    .controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, Auth) {
        'use strict';

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

            Auth.login(credentials, true)
                .then(function () {
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function () {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                })
                .finally(function() {
                    $scope.formProcessing = false;
                })
            ;
        };
    })

;