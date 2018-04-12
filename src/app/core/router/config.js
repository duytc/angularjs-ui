(function () {
    'use strict';

    angular.module('tagcade.core.router')
        .config(appConfig)

        .constant('BASE_USER_URLS', {
            admin: '/adm',
            publisher: '/pub',
            subPublisher: '/sub'
        })

        .constant('BASE_USER_STATES', {
            admin: 'app.admin',
            publisher: 'app.publisher',
            subPublisher: 'app.subPublisher'
        })

        .constant('STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION', {
            hide: 0,
            show: 1,
            auto: 2
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
                    if(Auth.isSubPublisher()) {
                        // todo
                        return urlPrefixService.getPrefixedUrl('/reports/unified/day');
                    }

                    return urlPrefixService.getPrefixedUrl('/dashboard');
                }

                return urlPrefixService.getPrefixedUrl('/error/404');
            });
        });
    }
})();