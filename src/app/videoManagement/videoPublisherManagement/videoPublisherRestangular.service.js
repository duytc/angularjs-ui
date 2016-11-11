(function () {
    'use strict';

    angular
        .module('tagcade.videoManagement.videoPublisher')
        .factory('videoPublisherRestangular', videoPublisherRestangular)
    ;

    function videoPublisherRestangular(Restangular, API_VIDEO_PUBLISHER_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_VIDEO_PUBLISHER_BASE_URL);
        });
    }

})();