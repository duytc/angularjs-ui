angular.module('tagcade.publisher.analytics', [
    'ui.router',

    'tagcade.reporting.sourceReports'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.analytics', {
                abstract: true,
                url: '/analytics'
            })
            .state('app.publisher.analytics.sourceReports', {
                url: '/sourceReports',
                views: {
                    'content@app': {
                        controller: 'SourceReportController',
                        templateUrl: 'reporting/sourceReports/views/sourceReports.tpl.html'
                    }
                }
            })
        ;
    })

;