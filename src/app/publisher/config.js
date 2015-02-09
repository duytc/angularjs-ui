(function () {
    'use strict';

    angular
        .module('tagcade.publisher')
        .provider('API_PUBLISHER_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/publisher/v1';
            }
        })
    ;

})();