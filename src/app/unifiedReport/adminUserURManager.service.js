(function () {
   'use strict';

    angular
        .module('tagcade.unifiedReport')
        .factory('adminUserURManager', adminUserURManager)
    ;

    function adminUserURManager(adminURRestangular) {
        var RESOURCE_NAME = 'users';

        adminURRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.lastLogin;
            }

            return element;
        });

        return adminURRestangular.service(RESOURCE_NAME);
    }
})();