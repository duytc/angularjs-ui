(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardDetail', dashboardDetail)
    ;

    function dashboardDetail($compile) {
        'use strict';

        return {
            scope: {
                overviewData: "=",
                compareTypeData:"=",
                comparisionData: "=",
                onChangeOverviewDate: "&",
                chartData: "=",
                dashboardType: "=",
                reportView: '=',
                publisher: "=",
                chartFollow: "=",
                onChangeChartFollow: "&"
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardDetail.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.onOverviewDateChange = function (date) {
                        scope.onChangeOverviewDate(date);
                    };
                    scope.onSelectFollow = function () {
                        scope.onChangeChartFollow();
                    };

                    directive || (directive = $compile(content));
                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();