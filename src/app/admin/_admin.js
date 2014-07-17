angular.module('tagcade.admin', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin.ui',
    'tagcade.admin.dashboard',
    'tagcade.admin.userManagement'
])

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.admin', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'admin/ui/views/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'admin/ui/views/nav.tpl.html'
                    }
                },
                url: '/adm',
                data: {
                    role: USER_ROLES.admin
                }
            })
            .state('app.admin.myAccount', {
                url: '/myAccount',
                views: {
                    'content@app': {
                        controller: 'MyAccountController',
                        templateUrl: 'core/myAccount/views/myAccount.tpl.html'
                    }
                }
            })
        ;
    })

;