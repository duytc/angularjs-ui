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
                        return urlPrefixService.getPrefixedUrl('/reports/performance/sites');
                    }

                    return urlPrefixService.getPrefixedUrl('/dashboard');
                }

                return urlPrefixService.getPrefixedUrl('/error/404');
            });
        });
    }
})();