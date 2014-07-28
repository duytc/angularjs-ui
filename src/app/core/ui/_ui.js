angular.module('tagcade.core.ui', [
    'ngAnimate',
    'ui.router',
    'ui.bootstrap'
])

    .config(function ($stateProvider, $urlRouterProvider) {
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
            // default state, used to invoke the initial redirect
            // i.e to a dashboard or login page
            .state('homeRedirect', {
                url: '/',
                controller: 'HomeController'
            })
            .state('404', {
                url: '/404',
                templateUrl: 'core/ui/views/404.tpl.html'
            })
            .state('403', {
                url: '/403',
                templateUrl: 'core/ui/views/403.tpl.html'
            })
        ;

        $urlRouterProvider.otherwise('/');
    })

;