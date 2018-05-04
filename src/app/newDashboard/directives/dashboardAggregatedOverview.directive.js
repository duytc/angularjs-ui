(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardAggregatedOverview', dashboardAggregatedOverview)
    ;

    function dashboardAggregatedOverview() {
        return {
            scope: {
                dashboardType: '=',
                overviewData: '=',
                onChangeChartFollow: '&',
                publisher: '=',
                chartFollow: '=',
                reportView: '=',
                comparisionData: '=',
                compareTypeData: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardAggregatedOverview.tpl.html',
            controller: 'DashboardAggregatedOverview'
        };
    }
})();