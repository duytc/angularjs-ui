angular.module('tagcade.publisher.tagManagement.adNetwork', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.tagManagement.adNetwork', {
                abstract: true,
                url: '/adNetwork'
            })
            .state('app.publisher.tagManagement.adNetwork.list', {
                url: '/list',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/adNetwork/views/list.tpl.html'
                    }
                }
            })
            .state('app.publisher.tagManagement.adNetwork.new', {
                url: '/new',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/adNetwork/views/new.tpl.html'
                    }
                }
            })
        ;
    })

;