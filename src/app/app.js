angular.module('tagcadeApp', [
    'ui.router',

    'templates-app',
    'templates-common',

    'tagcadeApp.core',
    'tagcadeApp.user',
    'tagcadeApp.publisher',
    'tagcadeApp.admin'
])

    .constant('ENTRY_STATE', 'login')

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            // all states should inherit from root
            // we can ensure that the current user has a valid session status
            .state('app', {
                abstract: true,
                template: '<div ui-view></div>',
                controller: 'AppController',
                resolve: {
                    userSession: function(Auth, Session) {
                        console.log('resolving user session');

                        return Auth.check()
                            .catch(function() {
                                // create blank session
                                return Session.createNew();
                            })
                        ;
                    }
                }
            })
            // default state, used to invoke the initial redirect
            // i.e to a dashboard or login page
            .state('app.home', {
                url: '/',
                controller: 'HomeController'
            })
            .state('404', {
                url: '/404',
                templateUrl: '404.tpl.html'
            })
            .state('403', {
                url: '/403',
                templateUrl: '403.tpl.html'
            })
        ;

        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');
    })

    .run(function ($rootScope, $state, Auth, HomeRedirector, ENTRY_STATE, AUTH_EVENTS) {
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event) {
            console.log('login success');
            HomeRedirector.redirect();
        });

        $rootScope.$on(AUTH_EVENTS.loginFailed, function(event) {
            console.log('login failed');
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
            console.log('not authenticated');
            $state.go(ENTRY_STATE);
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
            console.log('not authorized');
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            console.log('state change success', toState.name);
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.log('state change error', error);
        });
    })

;