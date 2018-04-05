(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardComparision', dashboardComparision)
    ;

    function dashboardComparision() {
        'use strict';

        return {
            scope: {
                dashboardType: "=",
                publisher: "=",
                reportView: "=",
                chartFollow: "=",
                comparisionData: "=",
                compareTypeData: "=",
                onChangeChartFollow: "&"
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardComparision.tpl.html',
            controller: 'DashboardComparision',
            link: function (scope, elem, attrs) {
                elem.bind('click', function (e) {
                    if ($(e.target).hasClass('btn-action')) {
                        e.stopPropagation();
                        return;
                    }
                    scope.conClickComparisionDirective();
                });
            }
        };
    }
})();