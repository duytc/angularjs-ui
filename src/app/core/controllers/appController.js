angular.module('tagcadeApp.core')

    .controller('AppController', function($rootScope, $scope, $state, Auth, userSession, AUTH_EVENTS, ENTRY_STATE) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            console.log('state change start', toState.name);

            var stateData = toState.data || {};

            if (stateData.hasOwnProperty('allowAnonymous')) {
                return;
            }

            if (!Auth.isAuthenticated()) {
                event.preventDefault();
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                return;
            }

            if (!stateData.hasOwnProperty('role')) {
                return;
            }

            var requiredRole = toState.data.role;

            if (!Auth.isAuthorized(requiredRole)) {
                event.preventDefault();
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            }
        });

        $scope.username = null;
        $scope.roles = null;
    })

;