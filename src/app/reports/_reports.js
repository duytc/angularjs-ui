angular.module('tagcade.reports', [
    'ui.router',

    'tagcade.reports.performanceReport'
])

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
