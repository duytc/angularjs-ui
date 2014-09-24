angular.module('tagcade.admin.userManagement')

    .factory('AdminUserManager', function (AdminRestangular) {
        'use strict';

        var RESOURCE_NAME = 'users';

        AdminRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.lastLogin;
            }

            return element;
        });

        return AdminRestangular.service(RESOURCE_NAME);
    })

;