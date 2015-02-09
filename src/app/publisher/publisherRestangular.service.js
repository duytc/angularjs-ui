(function () {
    'use strict';

    angular
        .module('tagcade.publisher')
        .factory('publisherRestangular', publisherRestangular)
    ;

    function publisherRestangular(Restangular, API_PUBLISHER_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_PUBLISHER_BASE_URL);
        });
    }

})();