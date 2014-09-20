angular.module('tagcade.core.data')

    .factory('SiteManager', function (Restangular, Auth) {
        'use strict';

        var RESOURCE_NAME = 'sites';

        return Restangular.service(RESOURCE_NAME);
    })

;