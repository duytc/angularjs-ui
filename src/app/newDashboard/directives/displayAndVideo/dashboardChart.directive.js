(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardChart', dashboardChart)
    ;

    function dashboardChart() {
        'use strict';

        return {
            scope: {
                overviewDateRange: "=",
                chartData: "=",
                dashboardType: '=',
                publisher: "=",
                chartFollow: "=",
                compareTypeData: "=",
                watchManager: "="
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/displayAndVideo/dashboardChart.tpl.html',
            controller: 'DashboardChart'
        };
    }
})();