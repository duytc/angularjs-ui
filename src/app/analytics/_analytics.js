angular.module('tagcade.analytics', [
    'ui.router',

    'tagcade.analytics.sourceReport'
])

    .config(function (UserStateHelperProvider, USER_MODULES) {
        'use strict';

        UserStateHelperProvider
            .state('analytics', {
                abstract: true,
                url: '/analytics',
                breadcrumb: {
                    title: 'Analytics'
                },
                data: {
                    requiredModule: USER_MODULES.analytics
                }
            })
        ;
    })

;
