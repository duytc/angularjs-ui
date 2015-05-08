(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdSlotManager', AdSlotManager)
    ;

    function AdSlotManager(Restangular) {
        var RESOURCE_NAME = 'adslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();