angular.module('tagcade.publisher', [
    'ui.router',

    'tagcade.core',
    'tagcade.publisher.ui',
    'tagcade.publisher.dashboard',
    'tagcade.publisher.tagManagement',
    'tagcade.publisher.reports',
    'tagcade.publisher.analytics',
    'tagcade.publisher.tools',
    'tagcade.publisher.billing'
])

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.publisher', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'publisher/ui/views/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'publisher/ui/views/nav.tpl.html'
                    }
                },
                url: '/pub',
                data: {
                    role: USER_ROLES.publisher
                }
            })
            .state('app.publisher.myAccount', {
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