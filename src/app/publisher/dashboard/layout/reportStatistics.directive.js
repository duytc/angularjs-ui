(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .directive('reportStatisticsPublisher', reportStatisticsPublisher)
    ;

    function reportStatisticsPublisher(){
        return {
            restrict: 'E',
            templateUrl: 'publisher/dashboard/layout/reportStatistics.tpl.html',
            scope:{
                dataStatistics: '=info'
            }
        }
    }
})();