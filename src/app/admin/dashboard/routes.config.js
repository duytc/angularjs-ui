(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider) {
        $stateProvider
            .state('app.admin.dashboard', {
                url: '/dashboard',
                controller: 'AdminDashboard',
                views: {
                    'content@app': {
                        controller: 'AdminDashboard',
                        templateUrl: 'admin/dashboard/dashboard.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dashboard'
                }
            })
        ;
    }
})();