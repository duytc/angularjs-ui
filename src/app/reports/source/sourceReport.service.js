(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .factory('sourceReport', sourceReport)
    ;

    function sourceReport($q, dataService, DateFormatter, API_REPORTS_BASE_URL, SiteManager)
    {
        var api = {
            getSiteReport: getSiteReport,
            getSiteReportDetail: getSiteReportDetail,
            getInitialParams: getInitialParams
        };

        var _$initialParams = null;

        return api;

        /////

        function makeHttpGetRequest(url, params)
        {
            params.startDate = DateFormatter.getFormattedDate(params.startDate);
            params.endDate = DateFormatter.getFormattedDate(params.endDate);

            return dataService.makeHttpGetRequest(url, params, API_REPORTS_BASE_URL)
                .catch(
                    function(response) {
                        if (response.status == 404) {
                            // if the response is 404, simply return a value, don't reject
                            return false;
                        }

                        return $q.reject(response);
                    }
                )
            ;
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param unfilteredParams.siteId
         * @param unfilteredParams.startDate
         * @param unfilteredParams.endDate
         * @returns {Promise}
         */
        function getSiteReport(unfilteredParams) {
            var serverParams = {
                siteId: unfilteredParams.siteId,
                startDate: unfilteredParams.startDate,
                endDate: unfilteredParams.endDate,
                rowLimit: 0
            };

            return getReport(unfilteredParams, serverParams);
        }

        /**
         *
         * @param {Object} unfilteredParams
         * @param unfilteredParams.siteId
         * @param unfilteredParams.date
         * @returns {Promise}
         */
        function getSiteReportDetail(unfilteredParams) {
            var serverParams = {
                siteId: unfilteredParams.siteId,
                startDate: unfilteredParams.date,
                rowLimit: 5000
            };

            return getReport(unfilteredParams, serverParams);
        }

        function getReport(unfilteredParams, serverParams) {
            return setInitialParams(unfilteredParams)
                .then(
                    function() {
                        return makeHttpGetRequest('/sourcereports/:siteId', serverParams);
                    }
                )
            ;
        }

        /**
         *
         * @param {Object} params
         * @return {Promise}
         */
        function setInitialParams(params) {
            if (!_.isObject(params) || !params.siteId) {
                return $q.reject(new Error('invalid initial params'));
            }

            var dfd = $q.defer();

            var sitePromise = SiteManager.one(params.siteId).get();

            sitePromise.then(function(siteData) {
                var site = siteData.plain();

                var publisherId;

                try {
                    publisherId = site.publisher.id;
                }
                catch (e) {
                    publisherId = null;
                }

                _$initialParams = angular.copy(params);
                _$initialParams.publisherId = publisherId;

                dfd.resolve();

                return _$initialParams;
            });

            return dfd.promise;
        }

        function getInitialParams() {
            if (!_$initialParams) {
                return {};
            }

            return angular.copy(_$initialParams);
        }
    }
})();