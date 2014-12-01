(function() {
    'use strict';

    angular.module('tagcade.core')
        .factory('responseInterceptor', responseInterceptor)
    ;

    function responseInterceptor($rootScope, $q, AUTH_EVENTS) {
        return {
            response: response
        };

        /////

        // ui-router will catch the error in $stateChangeError if the request was a resolve
        function response(response) {
            if(response.status == 403) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                return $q.reject(response);
            }

            if(response.status == 401) {
                $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout);
                return $q.reject(response);
            }

            return response;
        }
    }
})();