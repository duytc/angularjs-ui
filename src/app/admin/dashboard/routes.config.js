(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider.state('app.admin.dashboard', {
            url: '/dashboard?{startDate}&{endDate}',
            views: {
                'content@app': {
                    controller: 'AdminDashboard',
                    templateUrl: 'admin/dashboard/dashboard.tpl.html'
                }
            },
            resolve: {
                dataDashboard: function($stateParams, dashboard, userSession) {
                    return dashboard.getPlatformDashboard($stateParams, userSession);
                }
            },
            ncyBreadcrumb: {
                label: 'Dashboard'
            }
        });
    }
})();