angular.module('tagcade.reports', [
    'ui.router',

    'tagcade.reports.displayAds'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

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
