(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .directive('averageStatisticsAdmin', averageStatisticsAdmin)
    ;

    function averageStatisticsAdmin()
    {
        return {
            restrict: 'E',
            templateUrl: 'admin/dashboard/layout/averageStatistics.tpl.html',
            scope:{
                dataAverage: '=info'
            }
        }
    }
})();