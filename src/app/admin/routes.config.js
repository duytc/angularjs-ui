(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.admin', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'admin/layout/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'admin/layout/nav.tpl.html'
                    }
                },
                url: '/adm',
                data: {
                    requiredUserRole: USER_ROLES.admin
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })

            .state('app.admin.error', {
                abstract: true,
                url: '/error'
            })

            .state('app.admin.error.404', {
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

            .state('app.admin.error.403', {
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

            .state('app.admin.error.400', {
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

            .state('app.admin.error.500', {
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