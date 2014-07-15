angular.module('tagcadeApp.publisher.dashboard', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.dashboard', {
                url: '/dashboard',
                template: 'Welcome to the publisher dashboard'
            })
        ;
    })

;