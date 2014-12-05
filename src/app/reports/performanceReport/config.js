(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .constant('PERFORMANCE_REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            adNetwork: 'adNetwork',
            site: 'site'
        })

        .provider('API_PERFORMANCE_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/performancereports';
            }
        })
    ;
})();