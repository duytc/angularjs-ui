(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .factory('projectedBillService', projectedBillService)
    ;

    function projectedBillService(adminUserManager, dashboard) {
        var api = {
            getPublishers: getPublishers,
            getPlatformProjectedBill : getPlatformProjectedBill,
            getAccountProjectedBill: getAccountProjectedBill
        };

        return api;

        function getPublishers() {
            return adminUserManager.getList({ filter: 'publisher' })
                .then(function (users) {
                    return users.plain();
                })
            ;
        }

        function getPlatformProjectedBill() {
            return dashboard.getAdminProjectedBill();
        }

        function getAccountProjectedBill(publisherId) {
            return dashboard.getPublisherProjectedBill(publisherId);
        }
    }
})();