(function(angular) {
    'use strict';

    angular.module('tagcade.dashboard')
        .factory('dashboard', dashboard)
    ;

    function dashboard($q, API_STATS_BASE_URL, dataService, DateFormatter) {
        var api = {
            getPlatformDashboard: getPlatformDashboard,
            getPublisherDashboard: getPublisherDashboard
        };

        return api;

        /////

        function makeHttpGetRequest(url, params)
        {
            if (!params.startDate) {
                params.startDate = moment().subtract(7, 'days').startOf('day');
                params.endDate = moment().subtract(1, 'days').endOf('day');
            }

            params.startDate = DateFormatter.getFormattedDate(params.startDate);
            params.endDate = DateFormatter.getFormattedDate(params.endDate);

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
    }
})(angular);