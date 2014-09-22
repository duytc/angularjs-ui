angular.module('tagcade.publisher', [
    'ui.router',

    'tagcade.core',
    'tagcade.publisher.ui',
    'tagcade.publisher.dashboard',
    'tagcade.publisher.reports',
    'tagcade.publisher.analytics',
    'tagcade.publisher.tools',
    'tagcade.publisher.billing'
])

    .config(function ($stateProvider, USER_ROLES) {
        'use strict';

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
            .state('app.publisher.error', {
                abstract: true,
                url: '/error'
            })
            .state('app.publisher.error.404', {
                url: '/404',
                views: {
                    'content@app': {
                        controller: '404ErrorController'
                    }
                },
                breadcrumb: {
                    title: '404'
                }
            })
            .state('app.publisher.error.403', {
                url: '/403',
                views: {
                    'content@app': {
                        controller: '403ErrorController'
                    }
                },
                breadcrumb: {
                    title: '403'
                }
            })
            .state('app.publisher.error.500', {
                url: '/500',
                views: {
                    'content@app': {
                        controller: '500ErrorController'
                    }
                },
                breadcrumb: {
                    title: '500'
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