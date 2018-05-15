(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardUrDetail', dashboardUrDetail)
    ;

    function dashboardUrDetail($compile) {
        return {
            scope: {
                // bind properties
                dashboardType: "=",
                dateRange: "=",
                overviewData: "=",
                chartData: "=",
                reportView: '=',
                publisher: "=",
                comparisionData: "=",
                compareTypeData: "=",
                chartFollow: "=",
                // bind functions
                onChangeChartFollow: "&"
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/ur/view/dashboardUrDetail.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();

                return function (scope, element, attrs) {
                    /**
                     * on click of overview or comparison, we bind event back to main newDashboard page
                     * this is for showing chart data due to current selected item is overview or comparison
                     */
                    scope.onSelectFollow = function () {
                        // scope.onChangeChartFollow();
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