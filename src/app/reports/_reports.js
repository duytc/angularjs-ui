angular.module('tagcade.reports', [
    'ui.router',

    'tagcade.reports.performanceReport'
])

    .constant('REPORT_DATE_FORMAT', 'YYYY-MM-DD')

    .provider('API_REPORTS_BASE_URL', {
        $get: function(API_END_POINT) {
            return API_END_POINT + '/reports/v1';
        }
    })

    .factory('ReportsRestangular', function (Restangular, API_REPORTS_BASE_URL) {
        'use strict';

        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_REPORTS_BASE_URL);
        });
    })

    .config(function (UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports', {
                abstract: true,
                url: '/reports',
                breadcrumb: {
                    title: 'Reports'
                }
            })
        ;
    })

;
