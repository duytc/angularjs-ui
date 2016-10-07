(function() {
    'use strict';
    
    angular.module('tagcade.reports.video')
        .factory('videoReportService', videoReportService)
    ;
    
    function videoReportService(dataService, API_VIDEO_REPORTS_BASE_URL) {
        var api = {
            getPulsePoint: getPulsePoint
        };

        return api;

        function getReport(params) {
            if (!params) {
                params = {};
            }

            params.group = true;
            params.uniqueRequestCacheBuster = Math.random();

            return dataService.makeHttpGetRequest('', params, API_VIDEO_REPORTS_BASE_URL)
                .catch(function() {
                    return false
                });
        }

        function getPulsePoint(params, additionalParams) {
            return getReport(params, additionalParams);
        }
    }
})(angular);