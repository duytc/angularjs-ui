angular.module('tagcade.reports.displayAds', [
    'tagcade.reports.displayAds.performanceReport'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('reports.displayAds', {
                abstract: true,
                url: '/displayAds'
            })
        ;
    })

;
