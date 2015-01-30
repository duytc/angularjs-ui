(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .constant('PERFORMANCE_REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            adNetwork: 'adNetwork',
            site: 'site',
            adSlot: 'adslot'
        })

        .constant('PERFORMANCE_REPORT_STATES', {
            platformAccounts: '^.platformAccounts',
            sites: '^.sites',
            account: '^.account',
            siteAdSlots: '^.siteAdSlots',
            site: '^.site',
            adNetworkSite: '^.adNetworkSite',
            adNetworkSiteAdTags : '^.adNetworkSiteAdTags',
            adNetworkSites: '^.adNetworkSites',
            adNetwork: '^.adNetwork',
            adSlot: '^.adSlot',
            adSlotAdTags: '^.adSlotAdTags',
            adTags: 'adTags'
        })

        .constant('UPDATE_CPM_TYPES', {
            site: 'site',
            adNetwork: 'adNetwork',
            adTag: 'adTag'
        })

        .provider('API_PERFORMANCE_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/performancereports';
            }
        })
    ;
})();