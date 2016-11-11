(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .constant('HEADER_BIDDING_REPORT_STATES', {
            platformAccounts: '^.hbPlatformAccounts',
            sites: '^.hbSites',
            account: '^.hbAccount',
            siteAdSlots: '^.hbSiteAdSlots',
            site: '^.hbSite',
            siteByAdNetwork: '^.hbSiteByAdNetwork',
            adNetworkSite: '^.hbAdNetworkSite',
            adNetworkSites: '^.hbAdNetworkSites',
            adNetwork: '^.hbAdNetwork',
            adSlot: '^.hbAdSlot'
        })

        .provider('API_HEADER_BIDDING_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/headerbiddingreports';
            }
        })
    ;
})();