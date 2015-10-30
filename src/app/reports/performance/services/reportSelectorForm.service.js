(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .factory('reportSelectorForm', reportSelectorForm)
    ;

    function reportSelectorForm($filter, adminUserManager, AdNetworkManager, SiteManager, selectorFormCalculator, RonAdSlotManager, TYPE_AD_SLOT) {
        var api = {
            getPublishers: getPublishers,
            getAdNetworks: getAdNetworks,
            getSites: getSites,
            getAdSlotsForSite: getAdSlotsForSite,
            getRonAdSlot: getRonAdSlot,
            getSiteForAdNetwork: getSiteForAdNetwork,
            getCalculatedParams: getCalculatedParams
        };

        return api;

        /////

        function getPublishers() {
            return adminUserManager.getList({ filter: 'publisher' })
                .then(function (users) {
                    return users.plain();
                })
            ;
        }

        function getAdNetworks() {
            return AdNetworkManager.getList()
                .then(function (adNetworks) {
                    return adNetworks.plain();
                })
            ;
        }

        function getSites() {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
            ;
        }

        function getAdSlotsForSite(siteId) {
            return SiteManager.one(siteId).one('adslots').get()
                .then(function (adSlots) {
                    // remove dynamic ad slot
                    return $filter('filter')(adSlots.plain(), {type: '!'+TYPE_AD_SLOT.dynamic});
                }
            );
        }

        function getRonAdSlot() {
            return RonAdSlotManager.getList()
                .then(function(ronAdSlots) {
                    return ronAdSlots.plain();
                });
        }

        function getSiteForAdNetwork(adNetworkId) {
            return AdNetworkManager.one(adNetworkId).one('sites').getList()
                .then(function(datas) {
                    var sites = [];
                    angular.forEach(datas.plain(), function(data) {
                        sites.push(data.site);
                    });

                    return sites;
                })
        }

        function getCalculatedParams(initialParams) {
            return selectorFormCalculator.getCalculatedParams(initialParams);
        }

    }
})();