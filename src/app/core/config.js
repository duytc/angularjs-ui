(function () {
    'use strict';

    angular.module('tagcade.core')
        .constant('APP_NAME', 'Tagcade Platform')
        .constant('ENTRY_STATE', 'login')
        .config(config)
    ;

    function config($httpProvider, hljsServiceProvider, ngClipProvider) {
        $httpProvider.interceptors.push('authTokenInterceptor');
        $httpProvider.interceptors.push('responseErrorInterceptor');

        // config for highlight
        hljsServiceProvider.setOptions({
            // replace tab with 4 spaces
            tabReplace: '    '
        });

        // config for copy clipboard
        ngClipProvider.setPath("assets/swf/ZeroClipboard.swf");
    }
})();