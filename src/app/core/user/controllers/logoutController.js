angular.module('tagcade.core.user')

    .controller('LogoutController', function ($rootScope, Auth, AUTH_EVENTS) {
        Auth.logout();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    })

;