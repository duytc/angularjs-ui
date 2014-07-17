angular.module('tagcade.publisher.tagManagement', [
    'ui.router',

    'tagcade.publisher.tagManagement.adNetwork',
    'tagcade.publisher.tagManagement.site',
    'tagcade.publisher.tagManagement.adSlot',
    'tagcade.publisher.tagManagement.adTag'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.tagManagement', {
                abstract: true,
                url: '/tagManagement'
            })
            /*.state('app.publisher.tagManagement.sites', {
                abstract: true,
                url: '/sites'
            })
            .state('app.publisher.tagManagement.sites.mySites', {
                url: '/invoices',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/billing/views/invoices.tpl.html'
                    }
                }
            })

            .state('app.publisher.tagManagement.tags', {
                url: '/tags',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/billing/views/invoices.tpl.html'
                    }
                }
            })
            .state('app.publisher.tagManagement.tags.new', {
                url: '/new',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/billing/views/tags/new.tpl.html'
                    }
                }
            })*/
        ;
    })

;