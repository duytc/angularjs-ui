(function(angular) {
    'use strict';

    angular.module('tagcade.dashboard')
        .factory('dashboard', dashboard)
    ;

    function dashboard($q, API_STATS_BASE_URL, dataService, DateFormatter) {
        var api = {
            getPlatformDashboard: getPlatformDashboard,
            getPublisherDashboard: getPublisherDashboard,
            getPublisherProjectedBill: getPublisherProjectedBill,
            getAdminProjectedBill: getAdminProjectedBill,
            getSiteProjectedBill: getSiteProjectedBill
        };

        return api;

        /////

        function makeHttpGetRequest(url, params)
        {
            if(!params) {
                params = null;
            }
            else {
                if (!params.startDate) {
                    params.startDate = moment().subtract(7, 'days').startOf('day');
                    params.endDate = moment().subtract(1, 'days').endOf('day');
                }

                params.startDate = DateFormatter.getFormattedDate(params.startDate);
                params.endDate = DateFormatter.getFormattedDate(params.endDate);
            }

            return dataService.makeHttpGetRequest(url, params, API_STATS_BASE_URL);
        }

        function getPlatformDashboard(params) {
            return makeHttpGetRequest('/platform', params);
        }

        function getPublisherDashboard(params) {
            if (!angular.isNumber(params.id)) {
                return $q.reject(new Error('account id should be a number'));
            }

            return makeHttpGetRequest('/accounts/:id', params);
        }

        function getPublisherProjectedBill(params) {
            if (!angular.isNumber(params.publisherId)) {
                return $q.reject(new Error('account id should be a number'));
            }

            return makeHttpGetRequest('/accounts/:publisherId/projectedbill', params);
        }

        function getAdminProjectedBill() {
            return makeHttpGetRequest('/platform/projectedbill');
        }

        function getSiteProjectedBill(params) {
            if (!angular.isNumber(params.siteId)) {
                return $q.reject(new Error('site id should be a number'));
            }

            return makeHttpGetRequest('/sites/:siteId//projectedbill', params);
        }
    }
})(angular);