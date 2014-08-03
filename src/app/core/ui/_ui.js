angular.module('tagcade.core.ui', [
    'ngAnimate',
    'ui.router',
    'ui.bootstrap'
])

    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider
            // all states should inherit from root
            // we can ensure that the current user has a valid session status
            .state('app', {
                abstract: true,
                templateUrl: 'core/ui/views/app.tpl.html',
                controller: 'AppController',
                resolve: {
                    userSession: function(Auth) {
                        return Auth.getSession();
                    }
                }
            })
            .state('anon', {
                abstract: true,
                templateUrl: 'core/ui/views/anon.tpl.html'
            })
        ;

        $urlRouterProvider.otherwise('/');
    })

;