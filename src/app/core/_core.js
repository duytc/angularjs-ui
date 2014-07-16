angular.module('tagcadeApp.core', [
    'ui.router'
])

    .constant('API_BASE_URL', 'http://api.tagcade.dev/app_dev.php/api/v1')
    .constant('ENTRY_STATE', 'login')

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            // all states should inherit from root
            // we can ensure that the current user has a valid session status
            .state('app', {
                abstract: true,
                template: '<div ui-view></div>',
                controller: 'AppController'
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

        $urlRouterProvider.otherwise('/');
    })
;