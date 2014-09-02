angular.module('tagcade.core.data')

    .factory('SiteManager', function (Restangular, Auth) {
        'use strict';

        var RESOURCE_NAME = 'sites';

        Restangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (Auth.isAdmin()) {
                return element;
            }

            // if not an admin, do not send the publisher field to the server
            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.publisher;
            }

            return element;
        });

        return Restangular.service(RESOURCE_NAME);
    })

;