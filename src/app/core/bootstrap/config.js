(function () {
    'use strict';

    angular.module('tagcade.core.bootstrap')
        .constant('API_END_POINT', '//api.tagcade.dev/app_dev.php/api')

        .provider('API_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/v1';
            }
        })
    ;
})();