angular.module('tagcadeApp.core')

    .controller('HomeController', function($rootScope, Auth, HomeRedirector, AUTH_EVENTS) {
        if (!HomeRedirector.redirect()) {
            if (!Auth.isAuthenticated()) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            } else {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            }
        }
    })

;