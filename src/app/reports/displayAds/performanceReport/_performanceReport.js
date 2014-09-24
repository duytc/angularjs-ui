angular.module('tagcade.reports.displayAds.performanceReport', [])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('reports.displayAds.performanceReport', {
//                abstract: true,
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
