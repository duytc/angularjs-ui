angular.module('tagcade.core.auth', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('login', {
                parent: 'anon',
                url: '/login',
                controller: 'LoginController',
                templateUrl: 'core/auth/views/login.tpl.html',
                data: {
                    allowAnonymous: true
                }
            })
        ;
    })

    .constant('USER_ROLES', {
        admin: 'ROLE_ADMIN',
        publisher: 'ROLE_PUBLISHER'
    })

    .constant('USER_MODULES', {
        displayAds: 'MODULE_DISPLAY',
        video: 'MODULE_VIDEO',
        analytics: 'MODULE_ANALYTICS'
    })

    .constant('AUTH_EVENTS', {
        loginSuccess: 'tagcade.core.auth.login_success',
        loginFailed: 'tagcade.core.auth.login_failed',
        logoutSuccess: 'tagcade.core.auth.logout_success',
        sessionTimeout: 'tagcade.core.auth.session_timeout',
        notAuthenticated: 'tagcade.core.auth.not_authenticated',
        notAuthorized: 'tagcade.core.auth.not_authorized'
    })

;