(function () {
    'use strict';

    angular.module('tagcade.core')
        .factory('responseInterceptor', responseInterceptor)
    ;

    function responseInterceptor($rootScope, $q, EVENT_SEARCH_AGAIN) {
        return {
            response: response
        };

        function response(response) {
            if(response.config.method == 'DELETE' && response.status === 204) {
                $rootScope.$broadcast(EVENT_SEARCH_AGAIN)
            }

            return response || $q.when(response);
        }
    }
})();