(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider) {
        $stateProvider
            .state('app.publisher.dashboard', {
                url: '/dashboard?{startDate}&{endDate}',
                views: {
                    'content@app': {
                        controller: 'PublisherDashboard',
                        templateUrl: 'publisher/dashboard/dashboard.tpl.html'
                    }
                },
                resolve: {
                    dataDashboard: function(dashboard, userSession, $stateParams) {
                        var params = $.extend($stateParams, {id : userSession.id});
                        return dashboard.getPublisherDashboard(params);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dashboard'
                }
            })
        ;
    }
})();