(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .factory('cpmEditorService', cpmEditorService)
    ;

    function cpmEditorService($q, _, ReportParams, adminUserManager, SiteManager, AdNetworkManager) {
        var api = {
            getInitialParams: getInitialParams,
            getPublishers: getPublishers,
            getSites: getSites,
            getAdNetworkForPublisher: getAdNetworkForPublisher,
            getAdNetworks: getAdNetworks,
            getAdNetworkForAdmin: getAdNetworkForAdmin,
            getAdTag: getAdTag,
            getSite: getSite
        };

        var _$initialParams = null;

        return api;

        /////

        function getInitialParams() {
            return _$initialParams;
        }

        /**
         * @param {Object} params
         * @param {Object} [additionalParams]
         * @returns {Promise}
         */
        function setInitialParams(params, additionalParams) {
            params = angular.copy(params);

            if (!_.isObject(params)) {
                return $q.reject('missing parameters');
            }

            angular.extend(params, additionalParams);

            params = ReportParams.transformData(params);

            _$initialParams = angular.copy(params);
        }

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

        function getAdNetworkForPublisher(additionalParams) {
            setInitialParams('', additionalParams);

            return AdNetworkManager.getList();
        }

        function getAdNetworkForAdmin(params, additionalParams) {
            setInitialParams(params, additionalParams);

            return adminUserManager.one(params.publisherId).one('adnetworks').getList();
        }

        function getAdTag(params, additionalParams) {
            setInitialParams(params, additionalParams);

            return SiteManager.one(params.siteId).one('adtags/active').getList();
        }

        function getSite(params, additionalParams) {
            setInitialParams(params, additionalParams);

            return AdNetworkManager.one(params.adNetworkId).one('sites/active').getList();
        }
    }
})();