(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .run(errorHandler)
    ;

    function errorHandler($rootScope, UserStateHelper, AUTH_EVENTS) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.log('$stateChangeError', error);

            var responseCode = error.status;

            if (responseCode == 403) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                return;
            }

            if (responseCode == 401) {
                $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
                return;
            }

            // show generic error page unless we get more specific
            var errorCode = 500;

            if (404 == responseCode) {
                errorCode = 404;
            }

            if (400 == responseCode) {
                errorCode = 400;
            }

            UserStateHelper.transitionRelativeToBaseState('error.' + errorCode, {}, { location: 'replace' });
        });
    }
})();