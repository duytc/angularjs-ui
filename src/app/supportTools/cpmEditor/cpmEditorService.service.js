(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .factory('cpmEditorService', cpmEditorService)
    ;

    function cpmEditorService($q, adminUserManager, SiteManager, AdNetworkManager, AdSlotManager) {
        var api = {
            getPublishers: getPublishers,
            getSites: getSites,
            getAdNetworks: getAdNetworks,
            getSitesByAdNetwork: getSitesByAdNetwork,
            getAdSlotBySite: getAdSlotBySite,
            getAdTagByAdSlot: getAdTagByAdSlot
        };

        return api;

        function getPublishers() {
            return adminUserManager.getList({ filter: 'publisher' });
        }

        function getAdNetworks() {
            return AdNetworkManager.getList()
                .then(function (adNetworks) {
                    return adNetworks.plain();
                })
                ;
        }

        function getSitesByAdNetwork(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('adNetwork id should be a number'));
            }

            return AdNetworkManager.one(params.id).one('sites/active').getList();
        }

        function getSites() {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
                ;
        }

        function getAdSlotBySite(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('site id should be a number'));
            }

            return SiteManager.one(params.id).one('adslots').getList();
        }

        function getAdTagByAdSlot(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('ad slot id should be a number'));
            }

            return AdSlotManager.one(params.id).one('adtags').getList();
        }
    }
})();