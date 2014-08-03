angular.module('tagcade.publisher.dashboard', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.dashboard', {
                url: '/dashboard',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/dashboard/views/dashboard.tpl.html'
                    }
                }
            })
        ;
    })

;