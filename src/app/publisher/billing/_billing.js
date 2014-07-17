angular.module('tagcade.publisher.billing', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.publisher.billing', {
                abstract: true,
                url: '/billing'
            })
            .state('app.publisher.billing.viewMyUsage', {
                url: '/viewMyUsage',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/billing/views/viewMyUsage.tpl.html'
                    }
                }
            })
            .state('app.publisher.billing.invoices', {
                url: '/invoices',
                views: {
                    'content@app': {
                        templateUrl: 'publisher/billing/views/invoices.tpl.html'
                    }
                }
            })
        ;
    })

;