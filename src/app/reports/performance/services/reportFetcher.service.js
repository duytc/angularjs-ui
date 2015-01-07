(function(angular) {
    'use strict';

    angular.module('tagcade.reports.performance')
        .factory('ReportFetcher', ReportFetcher)
    ;

    function ReportFetcher($q, API_PERFORMANCE_REPORTS_BASE_URL, dataService, dateUtil) {
        var api = {
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

            params.startDate = dateUtil.getFormattedDate(params.startDate);

            if (!params.startDate) {
                return $q.reject(new Error('cannot get report, missing start date'));
            }

            params.endDate = dateUtil.getFormattedDate(params.endDate);
            params.group = true;

            return dataService.makeHttpGetRequest(url, params, API_PERFORMANCE_REPORTS_BASE_URL);
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
        function getPublisherAdNetworksReport(params) {
            return getReports('/accounts/:publisherId/adnetworks', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adNetworkId
         */
        function getAdNetworkReport(params) {
            return getReports('/adnetworks/:adNetworkId', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adNetworkId
         */
        function getAdNetworkAdTagsReport(params) {
            return getReports('/adnetworks/:adNetworkId/adtags', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adNetworkId
         */
        function getAdNetworkSitesReport(params) {
            return getReports('/adnetworks/:adNetworkId/sites', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adNetworkId
         * @param {int} params.siteId
         */
        function getAdNetworkSiteReport(params) {
            return getReports('/adnetworks/:adNetworkId/sites/:siteId', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adNetworkId
         * @param {int} params.siteId
         */
        function getAdNetworkSiteAdTagsReport(params) {
            return getReports('/adnetworks/:adNetworkId/sites/:siteId/adtags', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.publisherId
         */
        function getPublisherSitesReport(params) {
            return getReports('/accounts/:publisherId/sites', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getSiteReport(params) {
            return getReports('/sites/:siteId', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getSiteAdSlotsReport(params) {
            return getReports('/sites/:siteId/adslots', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getSiteAdTagsReport(params) {
            return getReports('/sites/:siteId/adtags', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.siteId
         */
        function getAdSlotAdTagsReport(params) {
            return getReports('/adslots/:adSlotId/adtags', params);
        }
    }
})(angular);