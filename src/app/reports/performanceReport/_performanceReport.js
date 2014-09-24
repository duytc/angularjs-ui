angular.module('tagcade.reports.performanceReport', [])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('reports.performanceReport', {
                url: '/performanceReports',
                views: {
                    'content@app': {
                        template: 'Performance reports here'
                    }
                },
                breadcrumb: {
                    title: 'Performance Report'
                }
            })
        ;
    })

;
