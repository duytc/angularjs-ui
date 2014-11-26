angular.module('tagcade.publisher', [
    'ui.router',

    'tagcade.core',

    'tagcade.publisher.layout',
    'tagcade.publisher.dashboard'
])

    .config(function ($stateProvider, USER_ROLES) {
        'use strict';

        $stateProvider
            .state('app.publisher', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'publisher/layout/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'publisher/layout/nav.tpl.html'
                    }
                },
                url: '/pub',
                data: {
                    requiredUserRole: USER_ROLES.publisher
                },
                ncyBreadcrumb: {
                    skip: true
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
                ncyBreadcrumb: {
                    label: '404'
                }
            })
            .state('app.publisher.error.403', {
                url: '/403',
                views: {
                    'content@app': {
                        controller: '403ErrorController'
                    }
                },
                ncyBreadcrumb: {
                    label: '403'
                }
            })
            .state('app.publisher.error.400', {
                url: '/400',
                views: {
                    'content@app': {
                        controller: '400ErrorController'
                    }
                },
                ncyBreadcrumb: {
                    label: '400'
                }
            })
            .state('app.publisher.error.500', {
                url: '/500',
                views: {
                    'content@app': {
                        controller: '500ErrorController'
                    }
                },
                ncyBreadcrumb: {
                    label: '500'
                }
            })
        ;
    })

;