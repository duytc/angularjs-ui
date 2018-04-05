(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('unifiedReportComparisionRestangular', unifiedReportComparisionRestangular)
    ;

    function unifiedReportComparisionRestangular(Restangular, API_UR_COMPARISION_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_UR_COMPARISION_BASE_URL);
        });
    }

})();