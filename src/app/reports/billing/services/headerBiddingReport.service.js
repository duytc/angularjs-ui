(function() {
    'use strict';
    
    angular.module('tagcade.reports.billing')
        .factory('HeaderBiddingReport', HeaderBiddingReport)
    ;
    
    function HeaderBiddingReport($q, _, HeaderBiddingReportFetcher, ReportParams) {
        var api = {
            getInitialParams: getInitialParams,
            resetParams: resetParams,

            getPlatformReport: getPlatformReport,
            getPlatformAccountsReport: getPlatformAccountsReport,
            getAccountReport: getAccountReport,
            getPlatformSitesReport: getPlatformSitesReport,
            getPublisherSitesReport: getPublisherSitesReport,
            getSiteReport: getSiteReport
        };

        var _$initialParams = null;

        return api;

        /////

        /**
         *
         * @param {object} params
         * @param {object} [additionalParams]
         * @returns {object|bool}
         */
        function processInitialParams(params, additionalParams) {
            params = angular.copy(params);

            if (!_.isObject(params)) {
                return false;
            }

            angular.extend(params, additionalParams);

            if (!params.startDate) {
                return false;
            }

            params = ReportParams.transformData(params);

            _$initialParams = angular.copy(params);

            return params;
        }

        /**
         *
         * @returns {object}
         */
        function getInitialParams() {
            if (!_$initialParams) {
                return {};
            }

            return angular.copy(_$initialParams);
        }

        function resetParams() {
            _$initialParams = null;
        }

        /**
         *
         * @param {function} fetcher
         * @param {object} params
         * @param {object} [additionalParams]
         * @returns {Promise}
         */
        function getReport(fetcher, params, additionalParams) {
            if (!_.isFunction(fetcher)) {
                return $q.reject(new Error('Expected a fetcher function'));
            }

            params = processInitialParams(params, additionalParams);

            if (!params) {
                return $q.reject(new Error('Invalid initial params supplied'));
            }

            params = _.omit(params, ['reportType', 'uniqueRequestCacheBuster', 'breakDown', 'subBreakDown','adSlotBreakdown', 'ronAdSlotBreakdown', 'siteBreakdown', 'adNetworkBreakdown']);

            return $q.when(fetcher(params)).catch(function(response) {
                if (response.status == 404) {
                    // if the response is 404, simply return a value, don't reject
                    return false;
                }

                return $q.reject(response);
            });
        }

        function getPlatformReport(params, additionalParams) {
            if (params.startDate == null) {
                params.startDate = moment().subtract(6, 'days').startOf('day').toDate();
                //params.endDate = moment().startOf('day').toDate();
                params.endDate = moment().subtract(1, 'days').startOf('day').toDate();
            }

            return getReport(HeaderBiddingReportFetcher.getPlatformReport, params, additionalParams);
        }

        function getPlatformAccountsReport(params, additionalParams) {
            return getReport(HeaderBiddingReportFetcher.getPlatformAccountsReport, params, additionalParams);
        }

        function getPlatformSitesReport(params, additionalParams) {
            return getReport(HeaderBiddingReportFetcher.getPlatformSitesReport, params, additionalParams);
        }

        function getPublisherSitesReport(params, additionalParams) {
            if (params.startDate == null) {
                params.startDate = moment().subtract(6, 'days').startOf('day').toDate();
                //params.endDate = moment().startOf('day').toDate();
                params.endDate = moment().subtract(1, 'days').startOf('day').toDate();
            }

            return getReport(HeaderBiddingReportFetcher.getPublisherSitesReport, params, additionalParams);
        }

        function getAccountReport(params, additionalParams) {
            if (params.startDate == null) {
                params.startDate = moment().subtract(6, 'days').startOf('day').toDate();
                //params.endDate = moment().startOf('day').toDate();
                params.endDate = moment().subtract(1, 'days').startOf('day').toDate();
            }

            return getReport(HeaderBiddingReportFetcher.getAccountReport, params, additionalParams);
        }

        function getSiteReport(params, additionalParams) {
            return getReport(HeaderBiddingReportFetcher.getSiteReport, params, additionalParams);
        }
    }
})(angular);