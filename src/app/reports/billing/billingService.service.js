(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .factory('billingService', billingService)
    ;

    function billingService($q, _, ReportParams, ReportFetcher, adminUserManager, dashboard) {
        var api = {
            getInitialParams: getInitialParams,
            getProjectedBillReport: getProjectedBillReport,
            getAccountReport: getAccountReport,
            getPublishers: getPublishers
        };

        var _$initialParams = null;

        return api;

        /////

        function getInitialParams() {
            return _$initialParams;
        }

        function getProjectedBillReport(publisherId) {
            return dashboard.getPublisherProjectedBill(publisherId);
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
    }
})();