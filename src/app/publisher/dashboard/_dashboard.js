angular.module('tagcadeApp.publisher.dashboard', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.dashboard', {
                url: '/dashboard',
                template: 'Welcome to the publisher dashboard. <a ui-sref="app.publisher.sites">Sites</a>'
            })
        ;
    })

;