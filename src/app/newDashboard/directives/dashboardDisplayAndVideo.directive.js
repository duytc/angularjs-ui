(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .directive('dashboardDisplayAndVideo', dashboardDisplayAndVideo)
    ;

    function dashboardDisplayAndVideo() {
        'use strict';

        return {
            scope: {
                publisher: '=',
                dashboardType: '=',
                rootWatchManager: '='
            },
            restrict: 'AE',
            templateUrl: 'newDashboard/directives/dashboardDisplayAndVideo.tpl.html',
            controller: 'DashboardDisplayAndVideo'
        };
    }
})();