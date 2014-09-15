angular.module('tagcade.core.data')

    .factory('AdTagManager', function (Restangular) {
        'use strict';

        var RESOURCE_NAME = 'adtags';

        return Restangular.service(RESOURCE_NAME);
    })

;