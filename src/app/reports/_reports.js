angular.module('tagcade.reports', [
    'ui.router',

    'tagcade.reports.performanceReport'
])

    .constant('REPORT_DATE_FORMAT', 'YYYY-MM-DD')

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
