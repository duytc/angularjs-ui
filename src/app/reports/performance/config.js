(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .constant('PERFORMANCE_REPORT_TYPES', {
            platform: 'platform',
            account: 'account',
            adNetwork: 'adNetwork',
            site: 'site',
            adSlot: 'adslot',
            ronAdSlot: 'ronAdSlot'
        })

        .constant('PERFORMANCE_REPORT_STATES', {
            platformAccounts: '^.platformAccounts',
            sites: '^.sites',
            account: '^.account',
            siteAdSlots: '^.siteAdSlots',
            site: '^.site',
            siteByAdNetwork: '^.siteByAdNetwork',
            adNetworkSite: '^.adNetworkSite',
            adNetworkSiteAdTags : '^.adNetworkSiteAdTags',
            adNetworkSites: '^.adNetworkSites',
            adNetwork: '^.adNetwork',
            adSlot: '^.adSlot',
            adSlotAdTags: '^.adSlotAdTags',
            ronAdSlot: '^.ronAdSlot',
            ronAdSlotSites: '^.ronAdSlotSites',
            ronAdSlotSegments: '^.ronAdSlotSegments',
            ronAdSlotAdTags: '^.ronAdSlotAdTags',
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