angular.module('tagcadeApp.admin.dashboard', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.admin.dashboard', {
                url: '/dashboard',
                controller: 'AdminDashboardController',
                template: 'Welcome to the admin dashboard'
            })
        ;
    })

;