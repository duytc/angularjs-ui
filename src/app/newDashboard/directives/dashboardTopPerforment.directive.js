(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardTopPerformance', dashboardTopPerformance)
    ;

    function dashboardTopPerformance() {
        'use strict';

        return {
            scope: {
                dashboardType: "=",
                dateRange: "=",
                reportView: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardTopPerforment.tpl.html',
            controller: 'DashboardTopPerformers'
        };
    }
})();