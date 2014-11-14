(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider) {
        $stateProvider
            .state('app.publisher.dashboard', {
                url: '/dashboard',
                views: {
                    'content@app': {
                        controller: 'PublisherDashboard',
                        templateUrl: 'publisher/dashboard/dashboard.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dashboard'
                }
            })
        ;
    }
})();