angular.module('tagcade.publisher.tagManagement', [
    'ui.router',

    'tagcade.publisher.tagManagement.adNetwork',
    'tagcade.publisher.tagManagement.site',
    'tagcade.publisher.tagManagement.adSlot',
    'tagcade.publisher.tagManagement.adTag'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tagManagement', {
                abstract: true,
                url: '/tagManagement'
            })
        ;
    })

;