(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .factory('ReportSelectorForm', ReportSelectorForm)
    ;

    function ReportSelectorForm(adminUserManager, AdNetworkManager, SiteManager) {
        var api = {
            getPublishers: getPublishers,
            getAdNetworks: getAdNetworks,
            getSites: getSites
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
    }
})();