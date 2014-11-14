(function () {
    'use strict';

    angular
        .module('tagcade.admin')
        .factory('AdminRestangular', AdminRestangular)
    ;

    function AdminRestangular(Restangular, API_ADMIN_BASE_URL) {
        'use strict';

        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_ADMIN_BASE_URL);
        });
    }

})();