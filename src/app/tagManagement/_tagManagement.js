angular.module('tagcade.tagManagement', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin',

    'tagcade.tagManagement.tagGenerator',
    'tagcade.tagManagement.adNetwork',
    'tagcade.tagManagement.site',
    'tagcade.tagManagement.adSlot',
    'tagcade.tagManagement.adTag'
])

    .config(function (UserStateHelperProvider) {
        'use strict';

        UserStateHelperProvider
            .state('tagManagement', {
                abstract: true,
                url: '/tagManagement',
                breadcrumb: {
                    title: 'Tag Management'
                }
            })
        ;
    })

;