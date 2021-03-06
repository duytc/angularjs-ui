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
                reportView: '=',
                comparisionData: '=',
                compareTypeData: '=',
                comparisonCustomDateRange: '=',
                watchManager: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/displayAndVideo/dashboardTopPerformance.tpl.html',
            controller: 'DashboardTopPerformers'
        };
    }
})();