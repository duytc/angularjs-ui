angular.module('tagcade.publisher.reports', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.reports', {
                abstract: true,
                url: '/reports'
            })
            .state('app.publisher.reports.performanceReports', {
                url: '/performanceReports',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/reports/views/performanceReports.tpl.html'
                    }
                }
            })
        ;
    })

;