(function() {
    'use strict';
    
    angular.module('tagcade.reports.rtb')
        .factory('rtbReport', rtbReport)
    ;
    
    function rtbReport($q, _, rtbReportFetcher, ReportParams) {
        var api = {
            getInitialParams: getInitialParams,
            resetParams: resetParams,

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
            getSiteAdNetworksReport: getSiteAdNetworksReport,
            getSiteAdSlotsReport: getSiteAdSlotsReport,
            getSiteAdTagsReport: getSiteAdTagsReport,
            getAdSlotReport: getAdSlotReport,
            getAdSlotAdTagsReport: getAdSlotAdTagsReport,
            getRonAdSlotReport: getRonAdSlotReport,
            getRonAdSlotSitesReport: getRonAdSlotSitesReport,
            getRonAdSlotSegmentsReport: getRonAdSlotSegmentsReport,
            getRonAdSlotAdTagsReport: getRonAdSlotAdTagsReport
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

            params = _.omit(params, ['reportType', 'uniqueRequestCacheBuster', 'adSlotBreakdown', 'ronAdSlotBreakdown', 'siteBreakdown', 'adNetworkBreakdown']); 

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

            return getReport(rtbReportFetcher.getPlatformReport, params, additionalParams);
        }

        function getPlatformAccountsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getPlatformAccountsReport, params, additionalParams);
        }

        function getPlatformSitesReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getPlatformSitesReport, params, additionalParams);
        }

        function getAccountReport(params, additionalParams) {
            if (params.startDate == null) {
                params.startDate = moment().subtract(6, 'days').startOf('day').toDate();
                //params.endDate = moment().startOf('day').toDate();
                params.endDate = moment().subtract(1, 'days').startOf('day').toDate();
            }

            return getReport(rtbReportFetcher.getAccountReport, params, additionalParams);
        }

        function getPublisherAdNetworksReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getPublisherAdNetworksReport, params, additionalParams);
        }

        function getAdNetworkReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdNetworkReport, params, additionalParams);
        }

        function getAdNetworkAdTagsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdNetworkAdTagsReport, params, additionalParams);
        }

        function getAdNetworkSitesReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdNetworkSitesReport, params, additionalParams);
        }

        function getAdNetworkSiteReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdNetworkSiteReport, params, additionalParams);
        }

        function getAdNetworkSiteAdTagsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdNetworkSiteAdTagsReport, params, additionalParams);
        }

        function getPublisherSitesReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getPublisherSitesReport, params, additionalParams);
        }

        function getSiteReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getSiteReport, params, additionalParams);
        }

        function getSiteAdNetworksReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getSiteAdNetworksReport, params, additionalParams);
        }

        function getSiteAdSlotsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getSiteAdSlotsReport, params, additionalParams);
        }

        function getSiteAdTagsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getSiteAdTagsReport, params, additionalParams);
        }

        function getAdSlotReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdSlotReport, params, additionalParams);
        }

        function getAdSlotAdTagsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getAdSlotAdTagsReport, params, additionalParams);
        }

        function getRonAdSlotReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getRonAdSlotReport, params, additionalParams);
        }

        function getRonAdSlotSitesReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getRonAdSlotSitesReport, params, additionalParams);
        }

        function getRonAdSlotSegmentsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getRonAdSlotSegmentsReport, params, additionalParams);
        }

        function getRonAdSlotAdTagsReport(params, additionalParams) {
            return getReport(rtbReportFetcher.getRonAdSlotAdTagsReport, params, additionalParams);
        }
    }
})(angular);