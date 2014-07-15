angular.module('tagcadeApp.user')

    .controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, Auth) {
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function (credentials) {
            Auth.login(credentials, true).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };
    })

;