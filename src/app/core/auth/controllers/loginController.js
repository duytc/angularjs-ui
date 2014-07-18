angular.module('tagcade.core.auth')

    .controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, Auth) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.loginProcessing = false;

        $scope.login = function (credentials) {
            $scope.loginProcessing = true;

            Auth.login(credentials, true).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };
    })

;