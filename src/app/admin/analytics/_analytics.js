angular.module('tagcade.admin.analytics', [
    'ui.router',

    'tagcade.reporting.sourceReports'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.admin.analytics', {
                abstract: true,
                url: '/analytics'
            })
            .state('app.admin.analytics.sourceReports', {
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