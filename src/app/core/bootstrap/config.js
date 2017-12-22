(function () {
    'use strict';

    angular.module('tagcade.core.bootstrap')
        .constant('API_END_POINT', 'http://api.pubvantage-dev.test/app_dev.php/api')
        .constant('API_UNIFIED_END_POINT', 'http://ur-api.pubvantage-dev.test/app_dev.php/api')

        .provider('API_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/v1';
            }
        })

        .provider('API_UNIFIED_PUBLIC_END_POINT', {
            $get: function(API_UNIFIED_END_POINT) {
                return API_UNIFIED_END_POINT + '/public';
            }
        })

        .provider('API_UNIFIED_BASE_URL', {
            $get: function(API_UNIFIED_END_POINT) {
                return API_UNIFIED_END_POINT + '/v1';
            }
        })
    ;
})();