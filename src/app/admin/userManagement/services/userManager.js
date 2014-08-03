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

        AdminRestangular.extendModel(RESOURCE_NAME, function(user) {
            user.getUserRoles = function() {
                return this.roles.filter(function(role) {
                    return role.indexOf('ROLE_') === 0;
                });
            };

            user.getEnabledFeatures = function() {
                return this.roles.filter(function(role) {
                    return role.indexOf('FEATURE_') === 0;
                });
            };

            return user;
        });

        return AdminRestangular.service(RESOURCE_NAME);
    })

;