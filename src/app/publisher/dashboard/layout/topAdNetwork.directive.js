(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .directive('topAdNetworkPublisher', topAdNetworkPublisher)
    ;

    function topAdNetworkPublisher(){
        return {
            restrict: 'E',
            templateUrl: 'publisher/dashboard/layout/topAdNetwork.tpl.html',
            scope: {
                dataTopStatistics: '=info',
                configTopStatistics: '=config'
            }
        }
    }
})();