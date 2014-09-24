angular.module('tagcade.displayAds.tagManagement', [
    'ui.router',

    'tagcade.displayAds.tagManagement.tagGenerator',
    'tagcade.displayAds.tagManagement.adNetwork',
    'tagcade.displayAds.tagManagement.site',
    'tagcade.displayAds.tagManagement.adSlot',
    'tagcade.displayAds.tagManagement.adTag'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('displayAds.tagManagement', {
                abstract: true,
                url: '/tagManagement',
                breadcrumb: {
                    title: 'Tag Management'
                }
            })
        ;
    })

;