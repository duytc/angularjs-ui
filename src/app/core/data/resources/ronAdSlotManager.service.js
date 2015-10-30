(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('RonAdSlotManager', RonAdSlotManager)
    ;

    function RonAdSlotManager(Restangular) {
        var RESOURCE_NAME = 'ronadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();