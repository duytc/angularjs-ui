angular.module('tagcade.core.auth')

    .controller('LogoutController', function ($rootScope, Auth, AUTH_EVENTS) {
        Auth.logout();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    })

;