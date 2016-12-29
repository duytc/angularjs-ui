(function() {
    'use strict';
    
    angular.module('tagcade.unifiedReport.report')
        .factory('unifiedReportBuilder', unifiedReportBuilder)
    ;

    function unifiedReportBuilder(dataService, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL) {
        var api = {
            getPlatformReport: getPlatformReport
        };

        return api;

        function getReport(params, extentUrl) {
            if (!params) {
                params = {};
            }

            return dataService.makeHttpGetRequest('', params, API_PERFORMANCE_UNIFIED_REPORTS_BASE_URL + extentUrl)
                .catch(function() {
                    return false
                });
        }

        function getPlatformReport(params) {
            return getReport(params, '/platform');
        }
    }
})(angular);