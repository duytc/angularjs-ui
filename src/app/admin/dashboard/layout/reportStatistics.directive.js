(function () {
    'use strict';

    angular
        .module('tagcade.admin.dashboard')
        .directive('reportStatisticsAdmin', reportStatisticsAdmin)
    ;

    function reportStatisticsAdmin(){
        return {
            restrict: 'E',
            templateUrl: 'admin/dashboard/layout/reportStatistics.tpl.html',
            scope:{
                dataStatistics: '=info'
            }
        }
    }
})();