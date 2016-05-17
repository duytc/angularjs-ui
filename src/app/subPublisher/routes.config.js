(function () {
    'use strict';

    angular
        .module('tagcade.subPublisher')
        .config(addStates)
    ;

    function addStates($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.subPublisher.dashboard', {
                url: '/dashboard?{startDate}&{endDate}',
                views: {
                    'content@app': {
                        templateUrl: 'subPublisher/dashboard/dashboard.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dashboard'
                }
            })
        ;

        $stateProvider
            .state('app.subPublisher', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'subPublisher/layout/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'subPublisher/layout/nav.tpl.html'
                    }
                },
                url: '/sub',
                data: {
                    requiredUserRole: USER_ROLES.subPublisher
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.subPublisher.error', {
                abstract: true,
                url: '/error'
            })
            .state('app.subPublisher.error.404', {
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
            .state('app.subPublisher.error.403', {
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
            .state('app.subPublisher.error.400', {
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
            .state('app.subPublisher.error.500', {
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
    }
})();