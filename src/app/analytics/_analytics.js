angular.module('tagcade.analytics', [
    'ui.router',

    'tagcade.analytics.sourceReport'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('analytics', {
                abstract: true,
                url: '/analytics',
                breadcrumb: {
                    title: 'Analytics'
                }
            })
        ;
    })

;
