angular.module('tagcade.publisher.tools', [
    'ui.router'
])

    .config(function ($stateProvider) {
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
        ;
    })

;