(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardUR', dashboardUR)
    ;

    function dashboardUR() {
        'use strict';

        return {
            scope: {
                publisher: '=',
                dashboardType: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardUR.tpl.html',
            controller: 'DashboardUR'
        };
    }
})();