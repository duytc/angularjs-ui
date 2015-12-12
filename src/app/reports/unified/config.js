(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .constant('REPORT_TYPE_KEY', {
            dailyStats: 'pp-daily-stats',
            adTag: 'pp-ad-tag',
            site: 'pp-site',
            adTagGroup: 'pp-ad-tag-group'

        })
        .provider('API_UNIFIED_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/unifiedreports';
            }
        })
    ;
})();