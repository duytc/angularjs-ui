(function() {
    'use strict';
    
    angular.module('tagcade.core.auth')
        .factory('authTokenInterceptor', authTokenInterceptor)
    ;

    function authTokenInterceptor($injector) {
        return {
            request: request
        };

        /////

        /**
         *
         * @param {Object} config
         * @returns {Object}
         */
        function request(config) {
            // get around circular dependency since Auth also relies on $http
            var Auth = $injector.get('Auth');

            if (Auth.isAuthenticated()) {
                var currentSession = Auth.getSession();
                config.headers['Authorization'] = Auth.getAuthorizationHeaderValue(currentSession.token);
            }

            return config;
        }
    }
})();