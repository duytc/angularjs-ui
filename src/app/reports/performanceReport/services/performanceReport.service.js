(function() {
    'use strict';
    
    angular.module('tagcade.reports.performanceReport')
        .factory('PerformanceReport', PerformanceReport)
    ;
    
    function PerformanceReport($q, _, ReportFetcher, ReportParams) {
        var api = {
            getInitialParams: getInitialParams,

            getPlatformReport: getPlatformReport,
            getPlatformAccountsReport: getPlatformAccountsReport,
            getPlatformSitesReport: getPlatformSitesReport,

            getAccountReport: getAccountReport,
            getPublisherAdNetworksReport: getPublisherAdNetworksReport,
            getAdNetworkReport: getAdNetworkReport,
            getAdNetworkAdTagsReport: getAdNetworkAdTagsReport,
            getAdNetworkSitesReport: getAdNetworkSitesReport,
            getAdNetworkSiteReport: getAdNetworkSiteReport,
            getAdNetworkSiteAdTagsReport: getAdNetworkSiteAdTagsReport,
            getPublisherSitesReport: getPublisherSitesReport,
            getSiteReport: getSiteReport,
            getSiteAdSlotsReport: getSiteAdSlotsReport,
            getSiteAdTagsReport: getSiteAdTagsReport,
            getAdSlotAdTagsReport: getAdSlotAdTagsReport
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

            return $q.when(fetcher(params)).catch(function(response) {
                if (response.status == 404) {
                    // if the response is 404, simply return a value, don't reject
                    return false;
                }

                return $q.reject(response);
            });
        }

        function getPlatformReport(params) {
            return getReport(ReportFetcher.getPlatformReport, params);
        }

        function getPlatformAccountsReport(params) {
            return getReport(ReportFetcher.getPlatformAccountsReport, params);
        }

        function getPlatformSitesReport(params) {
            return getReport(ReportFetcher.getPlatformSitesReport, params);
        }

        function getAccountReport(params, additionalParams) {
            return getReport(ReportFetcher.getAccountReport, params, additionalParams);
        }

        function getPublisherAdNetworksReport(params, additionalParams) {
            return getReport(ReportFetcher.getPublisherAdNetworksReport, params, additionalParams);
        }

        function getAdNetworkReport(params) {
            return getReport(ReportFetcher.getAdNetworkReport, params);
        }

        function getAdNetworkAdTagsReport(params) {
            return getReport(ReportFetcher.getAdNetworkAdTagsReport, params);
        }

        function getAdNetworkSitesReport(params) {
            return getReport(ReportFetcher.getAdNetworkSitesReport, params);
        }

        function getAdNetworkSiteReport(params) {
            return getReport(ReportFetcher.getAdNetworkSiteReport, params);
        }

        function getAdNetworkSiteAdTagsReport(params) {
            return getReport(ReportFetcher.getAdNetworkSiteAdTagsReport, params);
        }

        function getPublisherSitesReport(params, additionalParams) {
            return getReport(ReportFetcher.getPublisherSitesReport, params, additionalParams);
        }

        function getSiteReport(params) {
            return getReport(ReportFetcher.getSiteReport, params);
        }

        function getSiteAdSlotsReport(params) {
            return getReport(ReportFetcher.getSiteAdSlotsReport, params);
        }

        function getSiteAdTagsReport(params) {
            return getReport(ReportFetcher.getSiteAdTagsReport, params);
        }

        function getAdSlotAdTagsReport(params) {
            return getReport(ReportFetcher.getAdSlotAdTagsReport, params);
        }
    }
})(angular);