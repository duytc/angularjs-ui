(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .directive('averageStatisticsPublisher', averageStatisticsPublisher)
    ;

    function averageStatisticsPublisher()
    {
        return {
            restrict: 'E',
            templateUrl: 'publisher/dashboard/layout/averageStatistics.tpl.html',
            scope:{
                dataAverage: '=info'
            }
        }
    }
})();