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
            getSiteAdNetworksReport: getSiteAdNetworksReport,
            getSiteAdSlotsReport: getSiteAdSlotsReport,
            getSiteAdTagsReport: getSiteAdTagsReport,
            getAdSlotReport: getAdSlotReport,
            getAdSlotAdTagsReport: getAdSlotAdTagsReport,
            getRonAdSlotReport: getRonAdSlotReport,
            getRonAdSlotSitesReport: getRonAdSlotSitesReport,
            getRonAdSlotSegmentsReport: getRonAdSlotSegmentsReport,
            getRonAdSlotAdTagsReport: getRonAdSlotAdTagsReport,

            getPublisherAdNetworksByDayReport: getPublisherAdNetworksByDayReport,
            getPublisherSitesByDayReport: getPublisherSitesByDayReport,
            getPublisherAdNetworksByAdTagsReport: getPublisherAdNetworksByAdTagsReport,
            getPublisherAdNetworksBySubPublishersReport: getPublisherAdNetworksBySubPublishersReport,
            getAdNetworkSiteSubPublisherReport: getAdNetworkSiteSubPublisherReport
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
            return getReports('/accounts/:publisherId/adnetworks/all/adnetworks', params);
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

        function getSiteAdNetworksReport(params) {
            return getReports('/sites/:siteId/adnetworks', params);
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
         * @param {int} params.adSlotId
         */
        function getAdSlotReport(params) {
            return getReports('/adslots/:adSlotId', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.adSlotId
         */
        function getAdSlotAdTagsReport(params) {
            return getReports('/adslots/:adSlotId/adtags', params);
        }

        /**
         *
         * @param {object} params
         * @param {int} params.ronAdSlotId
         */
        function getRonAdSlotReport(params) {
            return getReports('/ronadslots/:ronAdSlotId', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getRonAdSlotSitesReport(params) {
            return getReports('/ronadslots/:ronAdSlotId/sites', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getRonAdSlotSegmentsReport(params) {
            return getReports('/ronadslots/:ronAdSlotId/segments', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getRonAdSlotAdTagsReport(params) {
            return getReports('/ronadslots/:ronAdSlotId/adtags', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getPublisherAdNetworksByDayReport(params) {
            return getReports('/accounts/:publisherId/adnetworks/all', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getPublisherSitesByDayReport(params) {
            return getReports('/accounts/:publisherId/sites/all', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getPublisherAdNetworksByAdTagsReport(params) {
            return getReports('/accounts/:publisherId/adnetworks/all/adtags', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getPublisherAdNetworksBySubPublishersReport(params) {
            return getReports('/accounts/:publisherId/partners/all/subpublishers', params);
        }

        /**
         *
         * @param params
         * @returns {Promise}
         */
        function getAdNetworkSiteSubPublisherReport(params) {
            return getReports('/accounts/:publisherId/partners/:adNetworkId/sites/all/subpublishers', params);
        }
    }
})(angular);