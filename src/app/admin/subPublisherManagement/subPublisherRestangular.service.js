(function () {
    'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .factory('subPublisherRestangular', subPublisherRestangular)
    ;

    function subPublisherRestangular(Restangular, API_SUB_PUBLISHER_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_SUB_PUBLISHER_BASE_URL);
        });
    }

})();