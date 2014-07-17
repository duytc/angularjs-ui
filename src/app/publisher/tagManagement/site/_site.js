angular.module('tagcade.publisher.tagManagement.site', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.tagManagement.sites', {
                abstract: true,
                url: '/sites'
            })
            .state('app.publisher.tagManagement.sites.list', {
                url: '/list',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/site/views/list.tpl.html'
                    }
                }
            })
            .state('app.publisher.tagManagement.sites.new', {
                url: '/new',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/tagManagement/site/views/new.tpl.html'
                    }
                }
            })
        ;
    })

;