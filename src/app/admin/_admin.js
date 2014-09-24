angular.module('tagcade.admin', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin.ui',
    'tagcade.admin.dashboard',
    'tagcade.admin.userManagement'
//    'tagcade.admin.analytics'
])

    .constant('API_ADMIN_BASE_URL', 'http://api.tagcade.dev/app_dev.php/api/admin/v1')

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
                    role: USER_ROLES.admin
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