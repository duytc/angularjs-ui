(function() {
    'use strict';

    angular.module('tagcade.reports')
        .constant('REPORT_DATE_FORMAT', 'YYYY-MM-DD')
        .constant('REPORT_SERVER_DATE_FORMAT', 'YYYY-MM-DD')
        .constant('REPORT_PRETTY_DATE_FORMAT', 'MMM DD, YYYY')
        .constant('REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            site: 'site'
        })

        .provider('API_REPORTS_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/reports/v1';
            }
        })
    ;
})();