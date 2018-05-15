(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardComparision', dashboardComparision)
    ;

    function dashboardComparision() {
        return {
            scope: {
                dashboardType: '=',
                publisher: '=',
                reportView: '=',
                chartFollow: '=',
                comparisionData: '=',
                compareTypeData: '=',
                onChangeChartFollow: '&'
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardComparision.tpl.html',
            controller: 'DashboardComparision'
        };
    }
})();