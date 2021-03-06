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
                compareTypeData: '=',
                dateRange: "=",
                notifyComparisonDataChange: '=',
                watchManager: '=',
                comparisonCustomDateRange: '=',
                rootWatchManager: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/displayAndVideo/dashboardAggregatedOverview-horizontal.tpl.html',
            controller: 'DashboardAggregatedOverview'
        };
    }
})();