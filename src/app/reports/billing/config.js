(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .constant('BILLING_REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            site: 'site'
        })
})();