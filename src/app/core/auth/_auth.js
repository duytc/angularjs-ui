angular.module('tagcade.core.auth', [
    'ui.router'
])

    .config(function ($stateProvider) {
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

    .constant('USER_FEATURES', {
        featureDisplay: 'FEATURE_DISPLAY',
        featureVideo: 'FEATURE_VIDEO',
        featureAnalytics: 'FEATURE_ANALYTICS'
    })

    .constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })

;