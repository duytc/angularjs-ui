(function () {
    'use strict';

    angular
        .module('tagcade.publisher.dashboard')
        .directive('topSitePublisher', topSitePublisher)
    ;

    function topSitePublisher(){
        return {
            restrict: 'E',
            templateUrl: 'publisher/dashboard/layout/topSite.tpl.html',
            scope: {
                dataTopStatistics: '=info',
                configTopStatistics: '=config'
            }
        }
    }
})();