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
                onDateChange: "&",
                publisher: "=",
                chartFollow: "="
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardOverview.tpl.html',
            controller: 'DashboardOverview',
            link: function (scope, elem, attrs) {
                elem.bind('click', function (e) {
                    if ($(e.target).hasClass('date-picker')) {
                        e.stopPropagation();
                        return;
                    }
                    scope.conClickOverViewDirective();
                });
            }
        };
    }
})();