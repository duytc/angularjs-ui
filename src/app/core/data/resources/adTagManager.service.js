(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdTagManager', AdTagManager)
    ;

    function AdTagManager(Restangular) {
        var RESOURCE_NAME = 'adtags';

        return Restangular.service(RESOURCE_NAME);
    }
})();