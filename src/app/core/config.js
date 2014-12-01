(function () {
    'use strict';

    angular.module('tagcade.core')
        .constant('APP_NAME', 'Tagcade Platform')
        .constant('ENTRY_STATE', 'login')
        .config(config)
    ;

    function config($httpProvider) {
        $httpProvider.interceptors.push('authTokenInterceptor');
        $httpProvider.interceptors.push('responseInterceptor');
    }
})();