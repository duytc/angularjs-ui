(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .factory('billingService', billingService)
    ;

    function billingService(adminUserManager, SiteManager) {
        var api = {
            getPublishers: getPublishers,
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

        function getSites() {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
                ;
        }
    }
})();