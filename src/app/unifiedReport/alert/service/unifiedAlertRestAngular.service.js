(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('UnifiedAlertRestAngular', UnifiedAlertRestAngular)
    ;

    function UnifiedAlertRestAngular(Restangular, API_UNIFIED_ALERT_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_UNIFIED_ALERT_BASE_URL);
        });
    }

})();