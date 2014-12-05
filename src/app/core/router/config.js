(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .config(appConfig)

        .constant('BASE_USER_URLS', {
            admin: '/adm',
            publisher: '/pub'
        })

        .constant('BASE_USER_STATES', {
            admin: 'app.admin',
            publisher: 'app.publisher'
        })
    ;

    function appConfig($urlRouterProvider) {
        $urlRouterProvider.when('', '/');

        $urlRouterProvider.otherwise(function($injector, $location) {
            var path = $location.path();

            return $injector.invoke(/* @ngInject */ function (Auth, urlPrefixService) {
                if (!Auth.isAuthenticated()) {
                    return '/login';
                }

                if (path === '/') {
                    return urlPrefixService.getPrefixedUrl('/dashboard');
                }

                return urlPrefixService.getPrefixedUrl('/error/404');
            });
        });
    }
})();