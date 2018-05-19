(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardUrChart', dashboardUrChart)
    ;

    function dashboardUrChart() {
        'use strict';

        return {
            scope: {
                overviewDateRange: "=",
                chartData: "=",
                dashboardType: '=',
                publisher: "=",
                chartFollow: "=",
                compareTypeData: "="
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/ur/view/dashboardUrChart.tpl.html',
            controller: 'DashboardUrChart'
        };
    }
})();