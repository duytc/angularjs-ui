(function () {
    'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .provider('API_SUB_PUBLISHER_BASE_URL', {
            $get: function(API_END_POINT) {
                return API_END_POINT + '/subpublisher/v1';
            }
        })
    ;

})();