angular.module('tagcade.displayAds', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin',

    'tagcade.displayAds.tagManagement'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('displayAds', {
                abstract: true,
                url: '/displayAds',
                breadcrumb: {
                    title: 'Display'
                }
            })
        ;
    })

;
