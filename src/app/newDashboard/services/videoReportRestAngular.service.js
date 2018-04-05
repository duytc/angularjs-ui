(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('VideoReportRestAngular', VideoReportRestAngular)
    ;

    function VideoReportRestAngular(Restangular, API_VIDEO_DASHBOARD_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_VIDEO_DASHBOARD_BASE_URL);
        });
    }

})();