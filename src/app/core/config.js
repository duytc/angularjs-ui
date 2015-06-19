(function () {
    'use strict';

    angular.module('tagcade.core')
        .constant('APP_NAME', 'Tagcade Platform')
        .constant('ENTRY_STATE', 'login')
        .config(config)
    ;

    function config($httpProvider, hljsServiceProvider) {
        $httpProvider.interceptors.push('authTokenInterceptor');
        $httpProvider.interceptors.push('responseErrorInterceptor');

        hljsServiceProvider.setOptions({
            // replace tab with 4 spaces
            tabReplace: '    '
        })
    }
})();