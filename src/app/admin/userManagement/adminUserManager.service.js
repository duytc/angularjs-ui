(function () {
   'use strict';

    angular
        .module('tagcade.admin.userManagement')
        .factory('adminUserManager', adminUserManager)
    ;

    function adminUserManager(adminRestangular) {
        var RESOURCE_NAME = 'users';

        adminRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.lastLogin;
            }

            return element;
        });

        return adminRestangular.service(RESOURCE_NAME);
    }
})();