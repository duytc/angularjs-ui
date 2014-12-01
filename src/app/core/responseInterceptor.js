(function() {
    'use strict';

    angular.module('tagcade.core')
        .factory('responseInterceptor', responseInterceptor)
    ;

    function responseInterceptor($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: responseError
        };

        /////

        function responseError(response) {
            if(response.status === 403) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                return $q.reject(response);
            }

            if(response.status === 401) {
                $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
                return $q.reject(response);
            }

            return true; // error not handled
        }
    }
})();