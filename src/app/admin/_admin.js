angular.module('tagcade.admin', [
    'ui.router',

    'tagcade.core',

    'tagcade.admin.ui',
    'tagcade.admin.dashboard',
    'tagcade.admin.userManagement'
])

    .provider('API_ADMIN_BASE_URL', {
        $get: function(API_END_POINT) {
            return API_END_POINT + '/admin/v1';
        }
    })

    .factory('AdminRestangular', function (Restangular, API_ADMIN_BASE_URL) {
        'use strict';

        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_ADMIN_BASE_URL);
        });
    })

    .config(function ($stateProvider, USER_ROLES) {
        'use strict';

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
                    requiredUserRole: USER_ROLES.admin
                }
            })
            .state('app.admin.error', {
                abstract: true,
                url: '/error',
                data: {
                    wideContent: true
                }
            })
            .state('app.admin.error.404', {
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
            .state('app.admin.error.403', {
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
            .state('app.admin.error.400', {
                url: '/400',
                views: {
                    'content@app': {
                        controller: '400ErrorController'
                    }
                },
                breadcrumb: {
                    title: '400'
                }
            })
            .state('app.admin.error.500', {
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
        ;
    })

;