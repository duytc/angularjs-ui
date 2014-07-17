angular.module('tagcade.publisher.tagManagement.adSlot', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.tagManagement.adSlot', {
                abstract: true,
                url: '/adSlot'
            })
            .state('app.publisher.tagManagement.adSlot.list', {
                url: '/list',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/adNetwork/views/list.tpl.html'
                    }
                }
            })
            .state('app.publisher.tagManagement.adSlot.new', {
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