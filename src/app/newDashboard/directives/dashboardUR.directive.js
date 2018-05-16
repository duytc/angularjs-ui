(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardUr', dashboardUr)
    ;

    function dashboardUr() {
        'use strict';

        return {
            scope: {
                publisher: '=',
                dashboardType: '=',
                rootWatchManager: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardUr.tpl.html',
            controller: 'DashboardUr'
        };
    }
})();