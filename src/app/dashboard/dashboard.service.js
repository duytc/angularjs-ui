(function(angular) {
    'use strict';

    angular.module('tagcade.dashboard')
        .factory('dashboard', dashboard)
    ;

    function dashboard($http, $q, API_STATS_BASE_URL) {
        var service = {
            getPlatformDashboard: getPlatformDashboard,
            getPublisherDashboard: getPublisherDashboard
        };

        return service;

        /////

        function getPlatformDashboard() {
            return $http.get(API_STATS_BASE_URL + '/platform');
        }

        function getPublisherDashboard(accountId) {
            if (!angular.isNumber(accountId)) {
                return $q.reject(new Error('account id should be a number'));
            }

            return $http.get(API_STATS_BASE_URL + '/accounts/' + accountId);
        }
    }
})(angular);