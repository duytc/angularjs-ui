angular.module('tagcadeApp.publisher', [
    'ui.router',

    'tagcadeApp.user',
    'tagcadeApp.publisher.dashboard',
    'tagcadeApp.publisher.site'
])

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.publisher', {
                abstract: true,
                template: '<div ui-view></div>',
                url: '/pub',
                data: {
                    role: USER_ROLES.publisher
                }
            })
        ;
    })

;