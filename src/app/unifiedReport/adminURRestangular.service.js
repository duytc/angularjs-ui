(function () {
    'use strict';

    angular
        .module('tagcade.unifiedReport')
        .factory('adminURRestangular', adminURRestangular)
    ;

    function adminURRestangular(Restangular, UR_API_ADMIN_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(UR_API_ADMIN_BASE_URL);
        });
    }

})();