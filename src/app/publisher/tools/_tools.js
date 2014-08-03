angular.module('tagcade.publisher.tools', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.publisher.tools', {
                url: '/tools'
            })
            .state('app.publisher.tools.cascadeManager', {
                url: '/cascadeManager',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tools/views/cascadeManager.tpl.html'
                    }
                }
            })
            .state('app.publisher.tools.cpmEditor', {
                url: '/cpmEditor',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tools/views/cpmEditor.tpl.html'
                    }
                }
            })
        ;
    })

;