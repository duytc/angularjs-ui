(function () {
    'use strict';

    angular.module('tagcade.core')
        .run(eventListeners)
    ;

    function eventListeners($rootScope, $translate, $state, AUTH_EVENTS, ENTRY_STATE, AlertService, UserStateHelper) {
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
            UserStateHelper.transitionRelativeToBaseState('dashboard');
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function() {
            AlertService.replaceAlerts({
                type: 'error',
                message: $translate.instant('EVENT_LISTENER.LOGIN_FAIL')
            });
        });

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
            $state.go(ENTRY_STATE).then(function () {
                AlertService.replaceAlerts({
                    message: $translate.instant('EVENT_LISTENER.LOGOUT_SUCCESS')
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
                    message: $translate.instant('EVENT_LISTENER.SESSION_EXPIRED')
                });
            });
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function() {
            console.log('not authorized');
            UserStateHelper.transitionRelativeToBaseState('error.403');
        });
    }
})();