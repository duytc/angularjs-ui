(function () {
   'use strict';

    angular
        .module('tagcade.publisher.accountManagement')
        .factory('accountManager', accountManager)
    ;

    function accountManager(publisherRestangular) {
        var RESOURCE_NAME = 'publishers/current';

        publisherRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.lastLogin;
            }

            return element;
        });

        return publisherRestangular.service(RESOURCE_NAME);
    }
})();