(function () {
    'use strict';

    angular
        .module('tagcade.dashboard')
        .provider('API_STATS_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/statistics/v1';
            }
        })
    ;

})();