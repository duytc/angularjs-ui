angular.module('tagcadeApp.admin', [
    'ui.router',

    'tagcadeApp.user',
    'tagcadeApp.admin.dashboard'
])

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.admin', {
                //parent: 'root',
                abstract: true,
                template: '<div ui-view></div>',
                url: '/adm',
                data: {
                    role: USER_ROLES.admin
                }
            })
        ;
    })

;