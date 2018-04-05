(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('UnifiedReportDashboardRestAngular', UnifiedReportDashboardRestAngular)
    ;

    function UnifiedReportDashboardRestAngular(Restangular, API_UNIFIED_DASHBOARD_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_UNIFIED_DASHBOARD_BASE_URL);
        });
    }

})();