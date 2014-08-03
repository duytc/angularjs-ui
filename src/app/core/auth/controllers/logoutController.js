angular.module('tagcade.core.auth')

    .controller('LogoutController', function ($rootScope, $scope, Auth, AUTH_EVENTS) {
        'use strict';

        $scope.logout = function() {
            Auth.logout();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };
    })

;