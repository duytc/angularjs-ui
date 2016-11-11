(function(angular) {
    'use strict';

    angular.module('tagcade.reports.billing')
        .factory('HeaderBiddingReportFetcher', HeaderBiddingReportFetcher)
    ;

    function HeaderBiddingReportFetcher($q, API_HEADER_BIDDING_REPORTS_BASE_URL, dataService, dateUtil) {
        var api = {
            getPlatformReport: getPlatformReport,
            getPlatformAccountsReport: getPlatformAccountsReport,
            getPlatformSitesReport: getPlatformSitesReport,
            getPublisherSitesReport: getPublisherSitesReport,
            getAccountReport: getAccountReport,

            getSiteReport: getSiteReport
        };

        return api;

        /////

        /**
         *
         * @param {string} url
         * @param {object} params
         * @returns {Promise}
         */
        function getReports(url, params) {
            if (!params) {
                params = {};
            }

            params = angular.copy(params);

            params.startDate = dateUtil.getFormattedDate(params.startDate);

            if (!params.startDate) {
                return $q.reject(new Error('cannot get report, missing start date'));
            }

            params.endDate = dateUtil.getFormattedDate(params.endDate);
            params.group = true;

            return dataService.makeHttpGetRequest(url, params, API_HEADER_BIDDING_REPORTS_BASE_URL);
        }

        /**
         *
         * @param {object} params
         */
        function getPlatformReport(params) {
            return getReports('/platform', params);
        }

        /**
         *
         * @param {object} params
         */
        function getPlatformAccountsReport(params) {
            return getReports('/platform/accounts', params);
        }

        /**
         *
         * @param {object} params
         */
        function getPlatformSitesReport(params) {
            return getReports('/platform/sites', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.publisherId
         */
        function getAccountReport(params) {
            return getReports('/accounts/:publisherId', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.publisherId
         */
        function getPublisherSitesReport(params) {
            return getReports('/accounts/:publisherId/sites/all/sites', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getSiteReport(params) {
            return getReports('/sites/:siteId', params);
        }
    }
})(angular);