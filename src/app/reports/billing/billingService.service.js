(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .factory('billingService', billingService)
    ;

    function billingService($q, _, ReportParams, ReportFetcher, adminUserManager, SiteManager) {
        var api = {
            getInitialParams: getInitialParams,
            getAccountReport: getAccountReport,
            getPublishers: getPublishers,
            getPlatformReport: getPlatformReport,
            getSites: getSites,
            getSiteReport: getSiteReport
        };

        var _$initialParams = null;

        return api;

        /////

        function getInitialParams() {
            return _$initialParams;
        }

        /**
         *
         * @param {Function} fetcher
         * @param {Object} params
         * @param {Object} [additionalParams]
         * @returns {Promise}
         */
        function getReport(fetcher, params, additionalParams) {
            params = angular.copy(params);

            if (!_.isObject(params)) {
                return $q.reject('missing parameters');
            }

            angular.extend(params, additionalParams);

            if (!params.startDate) {
                params.startDate = moment().subtract(7, 'days').startOf('day');
                params.endDate = moment().subtract(1, 'days').startOf('day');
            }

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

        function getAccountReport(params, additionalParams) {
            return getReport(ReportFetcher.getAccountReport, params, additionalParams);
        }

        function getPublishers() {
            return adminUserManager.getList({ filter: 'publisher' })
                .then(function (users) {
                    return users.plain();
                })
            ;
        }

        /**
         *
         * @param {object} params
         */
        function getPlatformReport(params, additionalParams) {
            return getReport(ReportFetcher.getPlatformReport, params, additionalParams);
        }

        function getSites() {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
                ;
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getSiteReport(params, additionalParams) {
            return getReport(ReportFetcher.getSiteReport, params, additionalParams);
        }
    }
})();