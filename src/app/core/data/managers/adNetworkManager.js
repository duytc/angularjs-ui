angular.module('tagcade.core.data')

    .factory('AdNetworkManager', function (Restangular) {
        'use strict';

        var RESOURCE_NAME = 'adnetworks';

        return Restangular.service(RESOURCE_NAME);
    })

;