(function () {
    'use strict';

    angular.module('tagcade.core')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider) {
        $stateProvider
            // all states should inherit from root
            // we can ensure that the current user has a valid session status
            .state('app', {
                abstract: true,
                templateUrl: 'core/layout/app.tpl.html',
                controller: 'AppController',
                resolve: {
                    userSession: function(Auth) {
                        return Auth.getSession();
                    }
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })

            .state('anon', {
                abstract: true,
                templateUrl: 'core/layout/anon.tpl.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })

            .state('public', {
                abstract: true,
                templateUrl: 'core/layout/public.tpl.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
        ;
    }
})();