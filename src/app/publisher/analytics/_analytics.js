angular.module('tagcade.publisher.analytics', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.analytics', {
                abstract: true,
                url: '/analytics'
            })
            .state('app.publisher.analytics.sourceReports', {
                url: '/sourceReports',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/analytics/views/sourceReports.tpl.html'
                    }
                }
            })
        ;
    })

;