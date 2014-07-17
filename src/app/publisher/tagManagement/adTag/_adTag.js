angular.module('tagcade.publisher.tagManagement.adTag', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.tagManagement.adTag', {
                abstract: true,
                url: '/adTag'
            })
            .state('app.publisher.tagManagement.adTag.new', {
                url: '/new',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/adTag/views/new.tpl.html'
                    }
                }
            })
        ;
    })

;