(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider.state('app.admin.dashboard', {
            url: '/dashboard',
            controller: 'AdminDashboard',
            views: {
                'content@app': {
                    controller: 'AdminDashboard',
                    templateUrl: 'admin/dashboard/dashboard.tpl.html'
                }
            },
            resolve: {
                dashboard: function(dashboard) {
                    return dashboard.getPlatformDashboard();
                }
            },
            ncyBreadcrumb: {
                label: 'Dashboard'
            }
        });
    }
})();