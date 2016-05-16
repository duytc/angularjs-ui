(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .run(authCheck)
    ;

    function authCheck($rootScope, Auth, AUTH_EVENTS, EXISTING_SESSION, STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION) {
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            console.log('$stateChangeStart', toState);

            var stateData = toState.data || {};

            // my login state will early return here
            if (stateData.allowAnonymous) {
                return;
            }

            function cancelStateChange(eventToBroadcast) {
                event.preventDefault();
                $rootScope.$broadcast(eventToBroadcast);
            }

            var currentSession = Auth.getSession();

            if (!currentSession) {
                // note, very important to return early, easy to miss why this is added, it stops further checks
                return cancelStateChange(AUTH_EVENTS.notAuthenticated);
            }

            var requiredRole = stateData.requiredUserRole;

            if (requiredRole && !currentSession.hasUserRole(requiredRole)) {
                return cancelStateChange(AUTH_EVENTS.notAuthorized);
            }

            var requiredModule = stateData.requiredModule;

            if (requiredModule && !currentSession.hasModuleEnabled(requiredModule)) {
                return cancelStateChange(AUTH_EVENTS.notAuthorized);
            }

            var demandSourceTransparency = stateData.demandSourceTransparency == undefined ? true : stateData.demandSourceTransparency;

            if(Auth.isSubPublisher()) {
                if((demandSourceTransparency === STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION.hide) || (demandSourceTransparency === STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION.auto && !currentSession.demandSourceTransparency)) {
                    return cancelStateChange(AUTH_EVENTS.notAuthorized);
                }
            }
        });
    }
})();