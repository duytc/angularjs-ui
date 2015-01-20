(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .factory('projectedBillService', projectedBillService)
    ;

    function projectedBillService(adminUserManager, $q, dashboard, ReportParams, SiteManager) {
        var api = {
            getInitialParams: getInitialParams,
            getPublishers: getPublishers,
            getSites: getSites,
            getPlatformProjectedBill : getPlatformProjectedBill,
            getAccountProjectedBill: getAccountProjectedBill,
            getSiteProjectedBill: getSiteProjectedBill
        };

        var _$initialParams = null;

        return api;

        ////

        function getInitialParams() {
            return _$initialParams;
        }

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

        function getReport(fetcher, params, additionalParams) {
            params = angular.copy(params);

            if (!_.isObject(params)) {
                return $q.reject('missing parameters');
            }

            angular.extend(params, additionalParams);

            params = ReportParams.transformData(params);

            _$initialParams = angular.copy(params);

            return $q.when(fetcher(params)).catch(function(response) {
                if (response.status == 404) {
                    // if the response is 404, simply return a value, don't reject
                    return false;
                }

                return $q.reject(response);
            });
        }

        function getPlatformProjectedBill(params, additionalParams) {
            return getReport(dashboard.getAdminProjectedBill, params, additionalParams);
        }

        function getAccountProjectedBill(params, additionalParams) {
            return getReport(dashboard.getPublisherProjectedBill, params, additionalParams);
        }

        function getSiteProjectedBill(params, additionalParams) {
            return getReport(dashboard.getSiteProjectedBill, params, additionalParams);
        }
    }
})();