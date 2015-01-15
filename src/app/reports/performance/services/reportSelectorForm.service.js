(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .factory('reportSelectorForm', reportSelectorForm)
    ;

    function reportSelectorForm(adminUserManager, AdNetworkManager, SiteManager, selectorFormCalculator) {
        var api = {
            getPublishers: getPublishers,
            getAdNetworks: getAdNetworks,
            getSites: getSites,
            getAdSlotsForSite: getAdSlotsForSite,
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
                    return adSlots.plain();
                }
            );
        }

        function getCalculatedParams(initialParams) {
            return selectorFormCalculator.getCalculatedParams(initialParams);
        }

    }
})();