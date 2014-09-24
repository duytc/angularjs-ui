angular.module('tagcade.analytics.sourceReport', [])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('analytics.sourceReport', {
//                abstract: true,
                url: '/sourceReports',
                views: {
                    'content@app': {
                        template: 'Source reports here'
                    }
                },
                breadcrumb: {
                    title: 'Source Report'
                }
            })
        ;
    })

;
