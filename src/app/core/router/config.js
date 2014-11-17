(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .config(appConfig)
    ;

    function appConfig($urlRouterProvider) {
        $urlRouterProvider.otherwise(function($injector) {
            $injector.invoke(/* @ngInject */ function ($state, Auth, UserStateHelper, ENTRY_STATE) {
                if (!Auth.isAuthenticated()) {
                    $state.go(ENTRY_STATE);
                    return;
                }

                UserStateHelper.transitionRelativeToBaseState('dashboard');
            });
        });
    }
})();