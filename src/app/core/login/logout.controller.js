(function () {
    'use strict';

    angular.module('tagcade.core.login')
        .controller('Logout', Logout)
    ;

    function Logout($rootScope, $scope, Auth, AUTH_EVENTS) {
        $scope.logout = function() {
            Auth.logout();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };
    }
})();