(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('DisplayDashboardRestAngular', DisplayDashboardRestAngular)
    ;

    function DisplayDashboardRestAngular(Restangular, API_COMPARISION_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_COMPARISION_BASE_URL);
        });
    }

})();