(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .factory('cpmEditorService', cpmEditorService)
    ;

    function cpmEditorService($q, adminUserManager, SiteManager, AdNetworkManager) {
        var api = {
            getPublishers: getPublishers,
            getSites: getSites,
            getAdNetworkForPublisher: getAdNetworkForPublisher,
            getAdNetworks: getAdNetworks,
            getAdNetworkForAdmin: getAdNetworkForAdmin,
            getAdTag: getAdTag,
            getSitesByAdNetwork: getSitesByAdNetwork
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

        function getSites() {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
                ;
        }

        function getAdNetworkForPublisher() {
            return AdNetworkManager.getList();
        }

        function getAdNetworkForAdmin(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('publisher id should be a number'));
            }

            return adminUserManager.one(params.id).one('adnetworks').getList();
        }

        function getAdTag(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('site id should be a number'));
            }

            return SiteManager.one(params.id).one('adtags/active').getList();
        }

        function getSitesByAdNetwork(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('adNetwork id should be a number'));
            }

            return AdNetworkManager.one(params.id).one('sites/active').getList();
        }
    }
})();