(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('unifiedReportRestangular', unifiedReportRestangular)
    ;

    function unifiedReportRestangular(Restangular, API_UNIFIED_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_UNIFIED_BASE_URL);
        });
    }

})();