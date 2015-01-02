(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .directive('topStatisticsAdmin', topStatisticsAdmin)
    ;

    function topStatisticsAdmin(){
        return {
            restrict: 'E',
            templateUrl: 'admin/dashboard/layout/topStatistics.tpl.html',
            scope: {
                dataTopStatistics: '=info',
                configTopStatistics: '=config'
            }
        }
    }
})();