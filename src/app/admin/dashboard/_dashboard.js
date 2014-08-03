angular.module('tagcade.admin.dashboard', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.admin.dashboard', {
                url: '/dashboard',
                controller: 'AdminDashboardController',
                views: {
                    'content@app': {
                        templateUrl: 'admin/dashboard/views/dashboard.tpl.html'
                    }
                },
                breadcrumb: {
                    title: 'Dashboard'
                }
            })
        ;
    })

;