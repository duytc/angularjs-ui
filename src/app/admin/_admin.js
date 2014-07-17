angular.module('tagcade.admin', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin.dashboard'
])

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.admin', {
                abstract: true,
                views: {
                    'nav@app': {
                        templateUrl: 'admin/ui/views/nav.tpl.html'
                    }
                },
                url: '/adm',
                data: {
                    role: USER_ROLES.admin
                }
            })
        ;
    })

;