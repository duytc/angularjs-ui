(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardOverviewDirective', dashboardOverviewDirective)
    ;

    function dashboardOverviewDirective() {
        'use strict';

        return {
            scope: {
                dashboardType: "=",
                overviewData: "=",
                onChangeChartFollow: "&",
                publisher: "=",
                chartFollow: "="
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/ur/view/dashboardOverview.tpl.html',
            controller: 'DashboardOverview'
        };
    }
})();