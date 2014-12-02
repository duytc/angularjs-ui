(function(angular) {
    'use strict';

    angular.module('tagcade.dashboard')
        .factory('dashboard', dashboard)
    ;

    function dashboard($q, API_STATS_BASE_URL, dataService) {
        var api = {
            getPlatformDashboard: getPlatformDashboard,
            getPublisherDashboard: getPublisherDashboard
        };

        return api;

        /////

        function makeHttpGetRequest(url, params)
        {
            return dataService.makeHttpGetRequest(url, params, API_STATS_BASE_URL);
        }

        function getPlatformDashboard() {
            return makeHttpGetRequest('/platform');
        }

        function getPublisherDashboard(accountId) {
            if (!angular.isNumber(accountId)) {
                return $q.reject(new Error('account id should be a number'));
            }

            return makeHttpGetRequest('/accounts/:id', {
                id: accountId
            });
        }
    }
})(angular);