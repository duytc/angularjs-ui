(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdNetworkManager', AdNetworkManager)
    ;

    function AdNetworkManager (Restangular) {
        var RESOURCE_NAME = 'adnetworks';

        return Restangular.service(RESOURCE_NAME);
    }
})();