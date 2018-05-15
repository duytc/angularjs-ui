(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardUrTopPerformance', dashboardUrTopPerformance)
    ;

    function dashboardUrTopPerformance() {
        return {
            scope: {
                dashboardType: "=",
                dateRange: "=",
                reportView: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/ur/view/dashboardUrTopPerformance.tpl.html',
            controller: 'DashboardUrTopPerformers'
        };
    }
})();