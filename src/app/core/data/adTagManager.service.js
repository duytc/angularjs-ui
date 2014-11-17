(function () {
    'use strict';

    angular.module('tagcade.core.data')
        .factory('AdTagManager', AdTagManager)
    ;

    function AdTagManager(Restangular) {
        var RESOURCE_NAME = 'adtags';

        return Restangular.service(RESOURCE_NAME);
    }
})();