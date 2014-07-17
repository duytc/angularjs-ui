angular.module('tagcade.publisher', [
    'ui.router',

    'tagcade.core',
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
                    'nav@app': {
                        templateUrl: 'publisher/ui/views/nav.tpl.html'
                    }
                },
                url: '/pub',
                data: {
                    role: USER_ROLES.publisher
                }
            })
        ;
    })

;