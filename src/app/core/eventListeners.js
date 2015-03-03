(function () {
    'use strict';

    angular.module('tagcade.core')
        .run(eventListeners)
    ;

    function eventListeners($rootScope, $state, AUTH_EVENTS, ENTRY_STATE, AlertService, UserStateHelper, autoLogin) {
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
            UserStateHelper.transitionRelativeToBaseState('dashboard');
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function() {
            AlertService.replaceAlerts({
                type: 'error',
                message: 'Login failed, did you provide an invalid username and/or password?'
            });
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $state.go(ENTRY_STATE).then(function () {
                AlertService.replaceAlerts({
                    message: 'You are now logged out'
                });
            });
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
            $state.go(ENTRY_STATE).then(function() {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: 'You are not authenticated. This could mean your session expired, please log in again'
                });
            });
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function() {
            console.log('not authorized');
            UserStateHelper.transitionRelativeToBaseState('error.403');
        });
    }
})();